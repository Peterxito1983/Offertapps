# Pruebas de Carga para OffertApps

## Descripción General

Este documento describe cómo configurar y ejecutar pruebas de carga para la aplicación OffertApps, tanto con herramientas automatizadas como con pruebas manuales.

## 1. Configuración de Pruebas de Carga con JMeter

### Instalación de JMeter
```bash
# Descargar JMeter desde el sitio oficial
wget https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.4.3.tgz
tar -xzf apache-jmeter-5.4.3.tgz
cd apache-jmeter-5.4.3
```

### Plan de Prueba de Carga Básico

#### 1. Configuración del Plan de Prueba
```
Test Plan
├── Thread Group (Usuarios Concurrentes)
│   ├── Number of Threads: 100
│   ├── Ramp-up Period: 60 (segundos)
│   └── Loop Count: 10
├── HTTP Request Defaults
│   └── Server Name: api.yourapp.com
├── HTTP Request - Registro de Usuario
│   ├── Path: /auth/register
│   ├── Method: POST
│   └── Parameters: email, password, displayName
├── HTTP Request - Inicio de Sesión
│   ├── Path: /auth/login
│   ├── Method: POST
│   └── Parameters: email, password
├── HTTP Request - Obtener Ofertas
│   ├── Path: /offers
│   └── Method: GET
├── HTTP Request - Crear Oferta
│   ├── Path: /offers
│   ├── Method: POST
│   └── Parameters: companyId, title, description, etc.
├── Response Assertion
├── View Results Tree (para debugging)
└── Summary Report
```

#### 2. Configuración de Usuarios Virtuales
- **Número de hilos (usuarios)**: 100-500 dependiendo del objetivo
- **Periodo de rampa**: 60-300 segundos para simular llegada gradual
- **Contador de bucles**: 10-100 para múltiples iteraciones

#### 3. Configuración de Aserciones
- Verificar códigos de estado HTTP (200, 201, etc.)
- Verificar tiempos de respuesta (menos de 2 segundos para operaciones críticas)
- Verificar contenido de respuesta

## 2. Pruebas de Carga con Artillery

### Instalación
```bash
npm install -g artillery
```

### Archivo de Configuración (load-test.yml)
```yaml
config:
  target: 'https://your-app-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up phase'
    - duration: 300
      arrivalRate: 20
      name: 'Sustained load phase'
    - duration: 60
      arrivalRate: 5
      name: 'Cool down phase'
  defaults:
    headers:
      content-type: 'application/json'

scenarios:
  - name: "User Registration Flow"
    weight: 3
    flow:
      - post:
          url: "/auth/register"
          json:
            email: "{{ faker.internet.email() }}"
            password: "{{ faker.internet.password() }}"
            displayName: "{{ faker.name.firstName() }}"
            role: "user"
      - get:
          url: "/user/profile"
          
  - name: "Browse Offers"
    weight: 5
    flow:
      - get:
          url: "/offers"
      - get:
          url: "/offers/category/comida"
          
  - name: "Create Offer (Companies)"
    weight: 2
    flow:
      - post:
          url: "/offers"
          headers:
            authorization: "Bearer {{ $processEnvironment.COMPANY_TOKEN }}"
          json:
            companyId: "{{ $processEnvironment.COMPANY_ID }}"
            title: "{{ faker.commerce.productName() }}"
            description: "{{ faker.lorem.paragraph() }}"
            discount: "{{ faker.commerce.price() }}"
            category: "Comida"
            offerType: "descuento"
```

### Ejecución
```bash
artillery run load-test.yml --output results.json
artillery report results.json
```

## 3. Pruebas de Carga con Scripts Personalizados

### Script de Prueba de Concurrentes (concurrent-test.js)
```javascript
const axios = require('axios');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

async function simulateUserActivity(userId) {
  try {
    // Simular registro de usuario
    const registerResponse = await axios.post('https://your-api.com/auth/register', {
      email: `user${userId}@test.com`,
      password: 'Password123',
      displayName: `User ${userId}`
    });
    
    // Simular inicio de sesión
    const loginResponse = await axios.post('https://your-api.com/auth/login', {
      email: `user${userId}@test.com`,
      password: 'Password123'
    });
    
    const token = loginResponse.data.token;
    
    // Simular navegación y acciones
    await axios.get('https://your-api.com/offers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`Usuario ${userId} completó flujo exitosamente`);
  } catch (error) {
    console.error(`Usuario ${userId} falló:`, error.message);
  }
}

if (cluster.isMaster) {
  console.log(`Maestro ${process.pid} está corriendo`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Workers pueden compartir cualquier TCP connection
  // En este caso, comparten el servidor HTTP
  for (let i = 0; i < 10; i++) { // Cada worker simula 10 usuarios
    simulateUserActivity(cluster.worker.id * 10 + i);
  }
}
```

## 4. Métricas de Rendimiento Clave

### Métricas a Monitorear
- **Tiempo de respuesta promedio**: Menos de 500ms para operaciones simples
- **Tiempo de respuesta percentil 95**: Menos de 2 segundos
- **Tasa de éxito**: Mayor al 95%
- **Tasa de errores**: Menor al 5%
- **Usuarios concurrentes soportados**: Determinado por objetivos de negocio

### Umbral de Rendimiento
- **Operaciones críticas**: < 1 segundo
- **Operaciones secundarias**: < 2 segundos
- **Operaciones pesadas**: < 5 segundos
- **Disponibilidad**: > 99.5%

## 5. Pruebas de Estrés y Resistencia

### Pruebas de Estrés
- Incrementar gradualmente la carga hasta el punto de ruptura
- Identificar el punto máximo de capacidad
- Observar comportamiento bajo condiciones extremas

### Pruebas de Resistencia
- Mantener carga constante durante períodos prolongados (horas/días)
- Verificar estabilidad y ausencia de pérdidas de memoria
- Validar que los tiempos de respuesta se mantengan estables

## 6. Configuración de Alertas

### Métricas de Alerta
- Tiempo de respuesta > 3 segundos (alerta amarilla)
- Tiempo de respuesta > 5 segundos (alerta roja)
- Tasa de errores > 10%
- Disponibilidad < 99%

### Destinatarios de Alertas
- Equipo de desarrollo
- Equipo de operaciones
- Stakeholders clave

## 7. Buenas Prácticas

1. **Probar en entornos similares a producción**
2. **Usar datos realistas**
3. **Simular patrones de uso real**
4. **Probar incrementos graduales de carga**
5. **Monitorear recursos del servidor durante pruebas**
6. **Documentar resultados y configuraciones**
7. **Reprobar después de cambios significativos**

## 8. Interpretación de Resultados

### Evaluación de Rendimiento
- Comparar tiempos de respuesta con objetivos establecidos
- Identificar cuellos de botella
- Determinar capacidad máxima de usuarios
- Evaluar necesidad de escalado

### Acciones Basadas en Resultados
- Optimizar consultas lentas
- Ajustar configuración de caché
- Escalar infraestructura si es necesario
- Revisar lógica de negocio para optimizaciones