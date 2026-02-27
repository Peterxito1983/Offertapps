# Seguridad de la Aplicación OffertApps

## 1. Reglas de Seguridad de Firebase Realtime Database

Las reglas de seguridad implementadas restringen el acceso a la base de datos según los roles de usuario:

- **Usuarios**: Pueden leer todos los datos, pero solo escribir en sus propios perfiles
- **Empresas**: Pueden leer todos los datos, pero solo escribir en sus propias ofertas y compañías
- **Administradores**: Tienen acceso completo a todos los datos

## 2. Validación y Sanitización de Entradas

Se han implementado validaciones en todos los servicios:

- Validación de formato de correo electrónico
- Validación de contraseña (mínimo 6 caracteres con mayúscula, minúscula y número)
- Validación de longitud de campos
- Sanitización de cadenas para prevenir XSS
- Validación de URLs

## 3. Protección contra Ataques

### CSRF (Cross-Site Request Forgery)
- Implementado sistema de tokens CSRF
- Tokens únicos por sesión

### Rate Limiting
- Límite de 10 solicitudes por minuto por usuario/IP
- Prevención de abuso de recursos

### Captcha
- Componente de captcha simple para formularios sensibles

## 4. Gestión Segura de Credenciales

- Uso de variables de entorno para credenciales de Firebase
- Verificación de presencia de variables requeridas
- Almacenamiento seguro de tokens de autenticación
- Uso de sessionStorage en lugar de localStorage para tokens temporales

## 5. Recomendaciones Adicionales

Para mayor seguridad en producción, se recomienda:

1. Implementar autenticación de dos factores (2FA)
2. Configurar autenticación de backend para operaciones críticas
3. Implementar auditoría de seguridad regular
4. Monitorear accesos no autorizados
5. Usar HTTPS en todos los entornos
6. Configurar Content Security Policy (CSP)
7. Implementar CORS de forma restrictiva