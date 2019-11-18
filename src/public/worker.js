// importScripts("/chat/frontend/service-worker.js")

// self.addEventListener("notificationclick", (event) => {
//     let url = 'https://rics.synology.me/chat/frontend/';
//     var notification = event.notification;
//     var action = event.action;

//     notification.close();

//     event.waitUntil(
//         clients.matchAll({ type: 'window' }).then(windowClients => {
//             for (var i = 0; i < windowClients.length; i++) {
//                 var client = windowClients[i];
//                 if (client.url === url) {
//                     if ('parent' in client && 'focus' in client.parent) client.parent.focus();      //focus on parent chrome and recent browsers
//                     if ('focus' in client) client.focus();                                          //older browser
//                     return;
//                 }
//             }

//             if (clients.openWindow) {
//                 clients.openWindow(url);
//                 return;
//             }
//         })
//     );
// });

