// src/firebase-messaging-sw.ts

// Este es un archivo de ejemplo para el service worker de Firebase Messaging
// En una implementación real, este archivo debería estar en la raíz pública

// Importar Firebase
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Inicializar Firebase con la configuración de tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyC9-2PcV43EXGZi8iT-N027rXJeLBVc6KM",
  authDomain: "offertapps.firebaseapp.com",
  projectId: "offertapps",
  storageBucket: "offertapps.firebasestorage.app",
  messagingSenderId: "945064284515",
  appId: "1:945064284515:web:dfbb63bd803e76dd064356",
  measurementId: "G-XCGV2RTT01",
  databaseURL: "https://offertapps-default-rtdb.firebaseio.com/"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener instancia de messaging
const messaging = firebase.messaging();

// Escuchar mensajes cuando la app está en segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('Mensaje recibido en segundo plano:', payload);
  
  const notificationTitle = payload.notification?.title || 'Nueva Notificación';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes un nuevo mensaje',
    icon: payload.notification?.icon || '/assets/icon/favicon.ico',
    badge: '/assets/icon/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Escuchar eventos de click en notificaciones
self.addEventListener('notificationclick', function(event) {
  console.log('Notificación clickeada:', event);
  
  // Cerrar la notificación
  event.notification.close();
  
  // Abrir ventana o navegar a la app
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});