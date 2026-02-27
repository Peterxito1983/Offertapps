// Script para actualizar el rol de usuario a ADMIN
// Ejecutar con: node update-admin-role.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update } from 'firebase/database';

// Configuración de Firebase (usando las mismas variables del .env)
const firebaseConfig = {
    apiKey: "AIzaSyC9-2PcV43EXGZi8iT-N027rXJeLBVc6KM",
    authDomain: "offertapps.firebaseapp.com",
    databaseURL: "https://offertapps-default-rtdb.firebaseio.com",
    projectId: "offertapps",
    storageBucket: "offertapps.firebasestorage.app",
    messagingSenderId: "945064284515",
    appId: "1:945064284515:web:dfbb63bd803e76dd064356",
    measurementId: "G-XCGV2RTT01"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function updateUserRole() {
    try {
        console.log('🔍 Buscando usuario jupiter.soluciones@gmail.com...');

        // Obtener todos los usuarios
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (!snapshot.exists()) {
            console.log('❌ No se encontraron usuarios en la base de datos');
            process.exit(1);
        }

        const users = snapshot.val();
        let userFound = false;

        // Buscar el usuario por email
        for (const [uid, userData] of Object.entries(users)) {
            if (userData.email === 'jupiter.soluciones@gmail.com') {
                console.log('✅ Usuario encontrado!');
                console.log('   UID:', uid);
                console.log('   Email:', userData.email);
                console.log('   Nombre:', userData.displayName);
                console.log('   Rol actual:', userData.role);

                // Actualizar el rol a ADMIN
                const userRef = ref(db, `users/${uid}`);
                await update(userRef, { role: 'ADMIN' });

                console.log('✅ Rol actualizado exitosamente a ADMIN');
                console.log('');
                console.log('🎉 ¡Listo! Ahora cierra sesión y vuelve a iniciar sesión para ver los cambios.');

                userFound = true;
                break;
            }
        }

        if (!userFound) {
            console.log('❌ No se encontró ningún usuario con el email jupiter.soluciones@gmail.com');
            console.log('   Asegúrate de haberte registrado primero.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateUserRole();
