importScripts("service-worker.js");

self.addEventListener("message", (e) => {
    if (e.data === "count") {
        console.log("count in service worker");
        self.postMessage("count");
    }
});