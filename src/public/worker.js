importScripts("/signalr/client/service-worker.js")

self.addEventListener("notificationclick", (event) => {
    let url = 'https://rics.synology.me/signalr/client/';
    var notification = event.notification;
    var action = event.action;
    
    notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

