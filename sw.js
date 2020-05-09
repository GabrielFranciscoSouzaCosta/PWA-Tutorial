const staticCacheName = 'site-static-v3';
const dynamicCache = 'site-dynamic-v1';
const assets = [
	'/',
	'/index.html',
	'/js/app.js',
	'/js/ui.js',
	'/js/materialize.min.js',
	'/css/styles.css',
	'/css/materialize.min.css',
	'/img/dish.png',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://fonts.gstatic.com/s/materialicons/v50/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2'
];

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
				.filter(key => key !== staticCacheName)
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
				return caches.open(dynamicCache).then(cache => {
					cache.put(evt.request.url, fetchRes.clone())
					return fetchRes
				})
			});
		})
	);

	//console.log( 'fetch event', evt );
});