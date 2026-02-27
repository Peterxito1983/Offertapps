# Guía de Administración - OffertApps

## Descripción General

Esta guía proporciona instrucciones detalladas para administradores de la aplicación OffertApps, incluyendo cómo gestionar usuarios, empresas, ofertas y procesos de verificación.

## 1. Acceso al Panel de Administración

### 1.1 Cómo Iniciar Sesión como Administrador
1. Acceder a la aplicación normalmente
2. Iniciar sesión con credenciales de administrador
3. El sistema redirigirá automáticamente al panel de administración
4. Alternativamente, acceder directamente a `/admin`

### 1.2 Credenciales de Administrador
- Los usuarios con rol `ADMIN` tienen acceso completo
- Los correos especiales `jupiter.soluciones@gmail.com` y `admin@offertapps.com` se convierten automáticamente en administradores
- Para convertir otros usuarios en administradores, se debe hacer directamente en la base de datos de Firebase

## 2. Gestión de Usuarios

### 2.1 Ver Lista de Usuarios
1. Iniciar sesión como administrador
2. Ir al panel de administración
3. Seleccionar la pestaña "Usuarios" (cuando esté disponible) o revisar directamente en Firebase Console
4. La lista mostrará:
   - ID del usuario
   - Nombre
   - Correo electrónico
   - Rol (Usuario, Empresa, Administrador)
   - Fecha de creación
   - Estado (activo/inactivo)

### 2.2 Gestionar Roles de Usuarios
1. Acceder a Firebase Console
2. Ir a Realtime Database
3. Navegar a la ruta `/users/{userId}`
4. Editar el campo `role`:
   - `"user"` para usuario regular
   - `"company"` para empresa
   - `"admin"` para administrador

### 2.3 Deshabilitar Usuarios (si está implementado)
1. En el panel de administración, seleccionar el usuario
2. Hacer clic en "Desactivar" o "Eliminar"
3. Confirmar la acción
4. El usuario ya no podrá iniciar sesión

### 2.4 Monitorear Actividad de Usuarios
- Verificar logs de autenticación
- Monitorear creación de ofertas y reseñas
- Revisar patrones de uso inusuales

## 3. Gestión de Empresas

### 3.1 Ver Lista de Empresas
1. En el panel de administración
2. Seleccionar la pestaña "Empresas"
3. La lista mostrará:
   - Nombre de la empresa
   - Logo
   - Plan de suscripción (básico/premium)
   - Estado de verificación
   - Número de sedes
   - Fecha de creación

### 3.2 Verificar Empresas
1. En la lista de empresas, identificar empresas no verificadas
2. Revisar la información de la empresa:
   - Nombre y logo
   - Sedes y ubicaciones
   - Información de contacto
3. Para verificar:
   - Hacer clic en el botón "Verificar" (✓)
   - Confirmar la acción
4. La empresa ahora aparecerá como verificada y sus ofertas serán visibles para los usuarios

### 3.3 Rechazar Empresas (Marcar como no verificadas)
1. En la lista de empresas, seleccionar una empresa verificada
2. Hacer clic en el botón "No Verificar" (⚠️)
3. Confirmar la acción
4. La empresa quedará como no verificada y sus ofertas dejarán de ser visibles

### 3.4 Eliminar Empresas
1. Seleccionar la empresa a eliminar
2. Hacer clic en el botón "Eliminar" (🗑️)
3. Confirmar la acción
4. Se eliminarán:
   - La empresa
   - Todas sus ofertas
   - Todas las reseñas asociadas a sus ofertas

### 3.5 Monitorear Empresas
- Verificar regularmente nuevas empresas registradas
- Asegurar que la información sea precisa
- Supervisar el comportamiento de empresas verificadas

## 4. Gestión de Ofertas

### 4.1 Ver Lista de Ofertas
1. En el panel de administración
2. Seleccionar la pestaña "Ofertas"
3. La lista mostrará:
   - Título de la oferta
   - Empresa que la publicó
   - Categoría
   - Fecha de creación
   - Estado (visible/invisible)

### 4.2 Eliminar Ofertas Inapropiadas
1. Identificar la oferta a eliminar
2. Hacer clic en el botón "Eliminar" (🗑️)
3. Confirmar la acción
4. La oferta dejará de estar visible para los usuarios

### 4.3 Supervisar Calidad de Ofertas
- Revisar descripciones y títulos
- Verificar imágenes y descuentos
- Asegurar que cumplan con las políticas de la plataforma

## 5. Gestión de Reseñas

### 5.1 Ver Lista de Reseñas
1. En el panel de administración
2. Seleccionar la pestaña "Reseñas"
3. La lista mostrará:
   - Usuario que escribió la reseña
   - Oferta a la que pertenece
   - Empresa involucrada
   - Calificación (1-5 estrellas)
   - Comentario
   - Fecha

### 5.2 Eliminar Reseñas Inapropiadas
1. Identificar la reseña a eliminar
2. Hacer clic en el botón "Eliminar" (🗑️)
3. Confirmar la acción
4. La reseña será removida permanentemente

### 5.3 Supervisar Contenido de Reseñas
- Buscar lenguaje inapropiado
- Identificar posibles reseñas falsas
- Verificar la autenticidad de las reseñas

## 6. Procesos de Verificación

### 6.1 Verificación de Empresas

#### Criterios de Verificación
Antes de verificar una empresa, asegurarse de que cumpla con:

**Información Completa:**
- Nombre de empresa válido
- Logo adecuado
- Información de sedes completa
- Datos de contacto precisos

**Legitimidad:**
- La empresa es real y operativa
- Tiene presencia física o digital verificable
- No está en listas de empresas fraudulentas

**Políticas de Plataforma:**
- Acepta los términos y condiciones
- Cumple con las políticas de contenido
- No ha tenido comportamientos inapropiados

#### Proceso de Verificación
1. **Revisión Inicial**
   - Verificar información proporcionada
   - Validar existencia de la empresa
   - Comprobar datos de contacto

2. **Verificación Manual**
   - Confirmar legitimidad de la empresa
   - Validar documentos si es necesario
   - Contactar a la empresa si es preciso

3. **Aprobación**
   - Marcar como verificada en el panel de administración
   - Notificar a la empresa sobre su estado
   - Supervisar actividad posterior

#### Proceso de Rechazo
1. **Identificación de Problemas**
   - Información incompleta o falsa
   - Empresa no legítima
   - Incumplimiento de políticas

2. **Notificación**
   - Informar a la empresa sobre el rechazo
   - Explicar razones del rechazo
   - Opción de apelación si aplica

### 6.2 Monitoreo Continuo
- Revisar periódicamente empresas verificadas
- Supervisar contenido publicado
- Actualizar estado de verificación si es necesario

## 7. Herramientas de Administración

### 7.1 Panel de Administración
- Accesible en la ruta `/admin`
- Interfaz gráfica para tareas comunes
- Vista consolidada de usuarios, empresas, ofertas y reseñas

### 7.2 Firebase Console
- Acceso directo a la base de datos
- Edición de datos cuando sea necesario
- Supervisión de seguridad y rendimiento

### 7.3 Herramientas de Monitoreo
- Ver logs de actividad
- Supervisar errores y problemas
- Analizar métricas de uso

## 8. Procedimientos de Emergencia

### 8.1 Contenido Inapropiado
1. Identificar contenido inapropiado
2. Eliminar inmediatamente
3. Investigar origen
4. Tomar medidas correctivas si es necesario

### 8.2 Problemas de Seguridad
1. Aislar el problema
2. Notificar al equipo de seguridad
3. Documentar el incidente
4. Implementar soluciones

### 8.3 Fallos del Sistema
1. Verificar estado del sistema
2. Revisar logs de error
3. Contactar soporte técnico si es necesario
4. Comunicar a usuarios si aplica

## 9. Reportes y Análisis

### 9.1 Reportes de Actividad
- Usuarios registrados por periodo
- Empresas verificadas
- Ofertas publicadas
- Reseñas recibidas

### 9.2 Métricas de Calidad
- Porcentaje de empresas verificadas
- Calidad promedio de ofertas
- Participación de usuarios

## 10. Buenas Prácticas de Administración

### 10.1 Consistencia
- Aplicar criterios uniformemente
- Mantener estándares claros
- Documentar decisiones

### 10.2 Transparencia
- Comunicar cambios a los usuarios
- Justificar decisiones de moderación
- Mantener políticas claras

### 10.3 Seguridad
- Proteger credenciales de administrador
- Supervisar acceso no autorizado
- Actualizar contraseñas regularmente

## 11. Soporte y Recursos

### 11.1 Contacto de Soporte
- Equipo de desarrollo: [correo de contacto]
- Soporte técnico: [correo de contacto]
- Seguridad: [correo de contacto]

### 11.2 Documentación Adicional
- Documentación de la API
- Guía de seguridad
- Procedimientos de backup

## 12. Actualizaciones y Mantenimiento

### 12.1 Actualizaciones de Seguridad
- Mantener Firebase actualizado
- Revisar reglas de seguridad periódicamente
- Actualizar dependencias

### 12.2 Mantenimiento Preventivo
- Backup regular de datos
- Supervisión de rendimiento
- Pruebas de funcionalidad

---

**Nota**: Esta guía debe actualizarse regularmente conforme evolucione la plataforma. Los administradores deben familiarizarse con estos procedimientos y seguirlos consistentemente para mantener la calidad y seguridad de la plataforma.