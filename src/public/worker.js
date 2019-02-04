importScripts("/signalr/client/service-worker.js")

self.addEventListener("notificationclick", (event)=>{
    var notification = event.notification;
    var action = event.action;
    notification.close();
    clients.openWindow("https://rics.synology.me/signalr/client/");
});