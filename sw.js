const staticCacheName = 'site-static-v3';
const dynamicCacheName = 'site-dynamic-v1';
const assets = [
	'http://localhost/gabriel/PWA-Tutorial/',
	'http://localhost/gabriel/PWA-Tutorial/index.html',
	'http://localhost/gabriel/PWA-Tutorial/js/app.js',
	'http://localhost/gabriel/PWA-Tutorial/js/ui.js',
	'http://localhost/gabriel/PWA-Tutorial/js/materialize.min.js',
	'http://localhost/gabriel/PWA-Tutorial/css/styles.css',
	'http://localhost/gabriel/PWA-Tutorial/css/materialize.min.css',
	'http://localhost/gabriel/PWA-Tutorial/img/dish.png',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://fonts.gstatic.com/s/materialicons/v50/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
	'http://localhost/gabriel/PWA-Tutorial/pages/fallback.html'
];

// cache size limit function
const limitCacheSize = (name, size) => {
	caches.open(name).then(cache => {
		cache.keys().then(keys => {
			if(keys.length > size)
			{
				cache.delete(keys[0]).then(limitCacheSize(name, size))
			}
		})
	})
}

self.addEventListener('install', (evt) => {
	// dentro do evento install é o lugar ideal para salvar os assets em cache
	
	evt.waitUntil(
		caches.open(staticCacheName).then(cache => {
			// console.log( 'caching shell assets' );
			cache.addAll(assets)
		})
	);

	//console.log('service worker has been installed');
});

//listening activate service worker
self.addEventListener('activate', evt => {
	// deleting all the old caches, every time we change our project we must to alter que name of our cache 
	evt.waitUntil(
		caches.keys().then(keys => {
			return Promise.all(keys
				.filter(key => key !== staticCacheName && key !== dynamicCacheName)
				.map(key => caches.delete(key))
			)
		})
	);
});

// fetch event
self.addEventListener('fetch', evt => {
	evt.respondWith(
		caches.match(evt.request).then(cacheRes => {
			return cacheRes || fetch(evt.request).then(fetchRes => {
				return caches.open(dynamicCacheName).then(cache => {
					cache.put(evt.request.url, fetchRes.clone());
					limitCacheSize(dynamicCacheName, 20);
					return fetchRes;
				})
			});
		}).catch(()=> {
			if(evt.request.url.indexOf('.html') > -1)
			{
				return caches.match('/pages/fallback.html')
			}
		})
	);
});