/* Game Night service worker — offline app shell + games */
const CACHE = "gamenight-v28";
const ASSETS = [
  "./", "index.html",
  "theleechlakegame/", "theleechlakegame/index.html",
  "cribbage/", "cribbage/index.html",
  "onpatrolbingo/", "onpatrolbingo/index.html",
  "threecardpoker/", "threecardpoker/index.html",
  "ultimatetexasholdem/", "ultimatetexasholdem/index.html",
  "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-180.png"
];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e=>{
  const req=e.request;
  if(req.method!=="GET") return;
  const url=new URL(req.url);
  if(url.origin!==location.origin) return;
  e.respondWith(
    caches.match(req).then(hit=> hit || fetch(req).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      return res;
    }).catch(()=> caches.match("index.html")))
  );
});
