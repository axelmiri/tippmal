const CACHE_NAME = "tippmal-cache-v1";

function getAssets(content) {
    const assetsToCache = [
        "./",
        "index.html",
        "style.css",
        "script.js",
        "content.json",
        "assets/favicon.png",
        "manifest.webmanifest",
    ];
    for (const group of content.groups) {
        addIfNotPresent(assetsToCache, group.image);
        for (const question of group.questions) {
            addIfNotPresent(assetsToCache, question.questionImage);
            for (const answerImage of question.answers) {
                addIfNotPresent(assetsToCache, answerImage);
            }
        }
    }
    for (const sound of content.correctSounds) {
        addIfNotPresent(assetsToCache, sound);
    }
    for (const sound of content.wrongSounds) {
        addIfNotPresent(assetsToCache, sound);
    }
    return assetsToCache;
}

self.addEventListener("install", (event) => {
    event.waitUntil(
        fetch("content.json")
            .then((response) => response.json())
            .then(async (content) => {
                const assetsToCache = getAssets(content);
                return caches.open(CACHE_NAME).then((cache) => {
                    return cache.addAll(assetsToCache);
                });
            })
            .catch((error) => {
                console.error(
                    "Failed to fetch content.json or cache assets:",
                    error
                );
            })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});

function addIfNotPresent(array, element) {
    if (!array.includes(element)) {
        array.push(element);
    }
}
