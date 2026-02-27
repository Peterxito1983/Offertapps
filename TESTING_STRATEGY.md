# Pruebas para OffertApps

## Descripción General

Este documento describe las pruebas implementadas para la aplicación OffertApps, cubriendo seguridad, funcionalidad y carga.

## 1. Pruebas de Seguridad

### Objetivo
Verificar que la aplicación esté protegida contra vulnerabilidades comunes y que las reglas de seguridad se apliquen correctamente.

### Áreas Cubiertas

#### 1.1 Autenticación y Autorización
- Validación de credenciales durante el registro e inicio de sesión
- Aplicación correcta de roles de usuario
- Control de acceso a recursos según roles
- Prevención de accesos no autorizados

#### 1.2 Validación de Entradas
- Validación de formato de correo electrónico
- Validación de contraseña (longitud, complejidad)
- Validación de longitud de campos
- Sanitización de entradas para prevenir XSS

#### 1.3 Control de Acceso Basado en Roles
- Usuarios regulares no pueden crear ofertas
- Empresas solo pueden gestionar sus propias ofertas
- Administradores tienen acceso completo
- Verificación de que las reglas de Firebase impiden accesos no autorizados

#### 1.4 Reglas de Firebase
- Verificación de que solo usuarios autenticados puedan leer datos sensibles
- Validación de que las reglas impidan accesos no autorizados
- Prueba de las reglas de seguridad implementadas

#### 1.5 Protección contra Ataques
- Protección contra inyección de dependencias
- Protección contra XSS (inyección de scripts)
- Protección contra CSRF (solicitud de falsificación de sitios cruzados)

### Ejemplos de Pruebas de Seguridad

```ts
test('No debe permitir registro con credenciales inválidas', async () => {
  // Intentar registrar con correo inválido
  await expect(signUp('correo-invalido', 'password123', 'Nombre'))
    .rejects
    .toThrow('Correo electrónico inválido');

  // Intentar registrar con contraseña débil
  await expect(signUp('test@example.com', '123', 'Nombre'))
    .rejects
    .toThrow('La contraseña debe tener al menos 6 caracteres, incluyendo mayúscula, minúscula y número');
});
```

## 2. Pruebas de Funcionalidad

### Objetivo
Verificar que todas las funcionalidades de la aplicación funcionen correctamente según los requisitos.

### Áreas Cubiertas

#### 2.1 Flujo de Autenticación de Usuarios
- Registro de nuevos usuarios
- Inicio de sesión de usuarios existentes
- Obtención del perfil del usuario actual
- Manejo de diferentes roles de usuario

#### 2.2 Gestión de Empresas
- Creación de nuevas empresas
- Obtención de empresas
- Actualización de información de empresas
- Eliminación de empresas
- Verificación de empresas por parte de administradores

#### 2.3 Gestión de Ofertas
- Creación de nuevas ofertas
- Obtención de ofertas
- Actualización de ofertas
- Eliminación de ofertas
- Filtrado y categorización de ofertas

#### 2.4 Gestión de Reseñas
- Creación de nuevas reseñas
- Obtención de reseñas por oferta
- Respuesta a reseñas por parte de empresas
- Eliminación de reseñas
- Calificación de ofertas

#### 2.5 Flujos Completos de Usuario
- Flujo completo de usuario: registro y creación de reseña
- Flujo completo de empresa: creación de oferta
- Flujo completo de administrador: verificación de empresa

#### 2.6 Validación de Datos
- Validación en todos los servicios
- Pruebas de borde para entradas inválidas
- Sanitización de entradas

### Ejemplos de Pruebas de Funcionalidad

```ts
test('Debe permitir el registro de nuevos usuarios', async () => {
  const result = await signUp(
    'test@example.com',
    'Password123',
    'Test User',
    Role.USER
  );

  expect(result.email).toBe('test@example.com');
  expect(result.displayName).toBe('Test User');
  expect(result.role).toBe(Role.USER);
});
```

## 3. Pruebas de Carga

### Objetivo
Verificar que la aplicación mantenga un buen rendimiento y estabilidad bajo condiciones de alta carga.

### Áreas Cubiertas

#### 3.1 Rendimiento con Múltiples Usuarios
- Manejo de múltiples registros de usuarios concurrentes
- Manejo de múltiples inicios de sesión concurrentes
- Manejo de múltiples solicitudes de datos concurrentes

#### 3.2 Rendimiento con Muchos Datos
- Creación de muchas empresas
- Creación de muchas ofertas
- Creación de muchas reseñas
- Obtención de grandes conjuntos de datos

#### 3.3 Estabilidad Bajo Carga
- Mantenimiento de estabilidad con operaciones concurrentes
- Manejo de operaciones concurrentes sin pérdida de datos
- Mantenimiento de la integridad de los datos bajo carga

#### 3.4 Tiempo de Respuesta
- Verificación de tiempos de respuesta rápidos para operaciones simples
- Mantenimiento de tiempos razonables para operaciones complejas
- Consistencia en los tiempos de respuesta bajo carga

#### 3.5 Uso de Memoria y Recursos
- Verificación de ausencia de fugas de memoria
- Manejo eficiente de grandes conjuntos de datos
- Paginación adecuada de grandes volúmenes de datos

### Ejemplos de Pruebas de Carga

```ts
test('Debe manejar múltiples registros de usuarios concurrentes', async () => {
  const numUsers = 10;
  const promises = [];

  for (let i = 0; i < numUsers; i++) {
    promises.push(signUp(
      `user${i}@example.com`,
      'Password123',
      `User ${i}`,
      Role.USER
    ));
  }

  const results = await Promise.all(promises);

  expect(results).toHaveLength(numUsers);
});
```

## 4. Configuración de Pruebas

### Estructura de Archivos
```
src/
  __tests__/
    security.test.ts      # Pruebas de seguridad
    functionality.test.ts # Pruebas de funcionalidad
    load.test.ts          # Pruebas de carga
```

### Framework de Pruebas
- Jest para pruebas unitarias e integración
- Mock de Firebase para pruebas aisladas
- Pruebas asincrónicas con soporte para operaciones concurrentes

## 5. Ejecución de Pruebas

### Comandos
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas de seguridad
npm test -- --testPathPattern=security

# Ejecutar pruebas de funcionalidad
npm test -- --testPathPattern=functionality

# Ejecutar pruebas de carga
npm test -- --testPathPattern=load

# Ejecutar pruebas con cobertura
npm test -- --coverage
```

## 6. Buenas Prácticas de Pruebas

1. **Pruebas Aisladas**: Cada prueba debe ser independiente de las demás
2. **Mock de Dependencias**: Usar mocks para servicios externos como Firebase
3. **Datos de Prueba Consistentes**: Usar datos predecibles para resultados consistentes
4. **Cobertura Adequada**: Asegurar cobertura de código crítica
5. **Pruebas de Borde**: Probar casos límite y entradas inválidas
6. **Pruebas de Integración**: Verificar la interacción entre componentes
7. **Pruebas de Rendimiento**: Incluir métricas de tiempo de respuesta

## 7. Próximos Pasos

1. Implementar pruebas end-to-end con Cypress o Puppeteer
2. Configurar pruebas automatizadas en CI/CD
3. Añadir pruebas de accesibilidad
4. Implementar pruebas de compatibilidad entre navegadores
5. Configurar monitoreo de rendimiento en producción