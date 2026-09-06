/* Game Night service worker — offline app shell + games
   HTML is network-first so a new build reaches phones as soon as they're online;
   everything else stays cache-first for speed and offline play. */
const CACHE = "gamenight-v47";
const ASSETS = [
  "./", "index.html",
  "theleechlakegame/", "theleechlakegame/index.html",
  "cribbage/", "cribbage/index.html",
  "bingo/", "bingo/index.html",
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
self.addEventListener("message", e=>{ if(e.data==="skipWaiting") self.skipWaiting(); });

function isDoc(req){
  return req.mode==="navigate" || (req.headers.get("accept")||"").indexOf("text/html")>=0;
}
self.addEventListener("fetch", e=>{
  const req=e.request;
  if(req.method!=="GET") return;
  const url=new URL(req.url);
  if(url.origin!==location.origin) return;          // never touch the ntfy sync traffic

  if(isDoc(req)){
    // network-first: a killed-and-reopened app must not serve yesterday's game
    e.respondWith(
      fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
        return res;
      }).catch(()=> caches.match(req).then(hit=> hit || caches.match("index.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit=> hit || fetch(req).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      return res;
    }).catch(()=> caches.match("index.html")))
  );
});
