//Pequenas partes são fornecidas por terceiros, fiz alterações para que funcione com URL amigáveis 
//e resolvi o alguns bugs sobre o comportamento do CSS com BootStrap
//ATENÇãO: ao colocar em seu site coloque nos meta dados os que coloquei no início

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';
//tst
// A list of local resources we always want to be cached.
function coletarCaminhos() {
    const precacheUrls = new Set();

    // Coleta todos os recursos estáticos (CSS, JS, imagens, etc.)
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        if (link.href) {
            precacheUrls.add(new URL(link.href, window.location.href).href);
        }
    });

    document.querySelectorAll('script[src]').forEach((script) => {
        if (script.src) {
            precacheUrls.add(new URL(script.src, window.location.href).href);
        }
    });

    document.querySelectorAll('img[src]').forEach((img) => {
        if (img.src) {
            precacheUrls.add(new URL(img.src, window.location.href).href);
        }
    });

    document.querySelectorAll('a[href]').forEach((a) => {
        if (a.hostname === window.location.hostname) {
            precacheUrls.add(new URL(a.href, window.location.href).href);
        }
    });

    document.querySelectorAll('video[src], audio[src]').forEach((media) => {
        if (media.src) {
            precacheUrls.add(new URL(media.src, window.location.href).href);
        }
    });

    // Captura botões ou qualquer outro elemento que tenha um comportamento de navegação (ex: onclick ou atributos de redirecionamento)
    document.querySelectorAll('button, [data-href]').forEach((btn) => {
        // Verifica se o botão tem um link associado
        let link = btn.getAttribute('data-href') || (btn.closest('a') ? btn.closest('a').href : null);
        if (link && link.startsWith(window.location.origin)) {
            precacheUrls.add(new URL(link, window.location.href).href);
        }
    });

    // Retorna todos os URLs encontrados
    return Array.from(precacheUrls);
}

const PRECACHE_URLS = coletarCaminhos();
console.log(PRECACHE_URLS);

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(PRECACHE)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Skip cross-origin requests, like those for Google Analytics.
    if (event.request.method === "POST") {
    }
    else {
        if (event.request.url.startsWith(self.location.origin)) {
            event.respondWith(
                caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return caches.open(RUNTIME).then(cache => {
                        return fetch(event.request).then(response => {
                            // Put a copy of the response in the runtime cache.
                            return cache.put(event.request, response.clone()).then(() => {
                                return response;
                            });
                        });
                    });
                })
            );
        }
    }
});