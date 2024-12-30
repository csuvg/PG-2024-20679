# Proyecto de Graduación - PG-2024-20679

## Descripción

Este proyecto tiene como finalidad desarrollar el módulo backend de una aplicación móvil innovadora para mejorar la gestión de residuos en la Ciudad de Guatemala, incentivando a los usuarios a reducir su huella de carbono mediante prácticas sostenibles en sus hogares. La aplicación ofrece herramientas para clasificar correctamente los desechos y realizar un seguimiento de su impacto ambiental, permitiendo adoptar hábitos de consumo más responsables.

El backend incluye gestión, almacenamiento y análisis de datos generados por los usuarios, con un enfoque en la seguridad de la información y la integración con el frontend. Además, ofrece análisis personalizados para visualizar métricas como la reducción de CO2 y el ahorro de agua.

## Instrucciones de Instalación

### Requisitos previos

Asegúrese de tener instalados los siguientes componentes en su entorno:

- Node.js (versión 14 o superior)
- NPM (gestor de paquetes para Node.js)
- PostgreSQL (base de datos relacional)

### Configuración

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/csuvg/PG-2024-20679.git
   cd PG-2024-20679
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Configurar las variables de entorno:

   Copie el archivo `.env.example` dentro de la carpeta `src` y renómbrelo como `.env`. Luego configure las siguientes variables según su entorno:

   - **DB_NAME**: Nombre de la base de datos.
   - **DB_USER**: Usuario de la base de datos.
   - **DB_PASS**: Contraseña del usuario de la base de datos.
   - **DB_HOST**: Dirección del servidor de la base de datos.
   - **DB_DIALECT**: Dialecto de base de datos utilizado (por ejemplo, `postgres`).
   - **SENTRY_DSN**: URL de conexión para monitoreo de errores con Sentry.
   - **API_USER** y **API_PASS**: Credenciales para acceso API interno.
   - **JWT_SECRET**: Clave secreta para la generación de tokens JWT.
   - **NODE_ENV**: Indica el entorno actual (`development`, `production` o `test`).

4. Ejecutar migraciones de base de datos:

   ```bash
   npx sequelize db:migrate
   ```

5. Iniciar el servidor:

   ```bash
   npm start
   ```

### Pruebas

El proyecto incluye diferentes tipos de pruebas para garantizar la calidad del código y el rendimiento del sistema:

#### Pruebas Unitarias

- Comando:
  ```bash
  npm run test:unit
  ```
- Descripción: Validan el funcionamiento de unidades individuales del código, como funciones o métodos específicos.

#### Pruebas de Integración

- Comando:
  ```bash
  npm run test:integration
  ```
- Descripción: Verifican la interacción entre diferentes módulos o componentes del sistema.

#### Pruebas de Cobertura

- Comando:
  ```bash
  npm run test:coverage
  ```
- Descripción: Generan un informe de cobertura de código para asegurarse de que todas las partes críticas están probadas.

#### Pruebas de Rendimiento

- Comando:
  ```bash
  npm run test:performance
  ```
- Descripción: Miden el rendimiento del sistema bajo diferentes niveles de carga utilizando Artillery.

Para ejecutar todas las pruebas de forma global:

```bash
npm test
```

## Demo

En la carpeta `/demo` encontrará un video demostrativo (`demo.mp4`) que muestra las principales funcionalidades del proyecto.

## Informe Final

El informe completo sobre el desarrollo del proyecto, incluyendo detalles técnicos, metodológicos y resultados, está disponible en la carpeta `/docs/` del repositorio.

**Enlace directo al informe**: [Informe Final (PDF)](./docs/informe_final.pdf)

## Estructura del Proyecto

La estructura del proyecto es la siguiente:

```
PG-2024-20679/
├── demo/
│   └── demo.mp4
├── docs/
│   └── informe_final.pdf
├── src/
│   ├── .env.example
│   ├── package.json
│   └── [archivos del código fuente]
├── README.md
└── .gitignore
```

## Contribuciones

Las contribuciones están abiertas para mejorar el proyecto. Por favor, cree un issue o envíe un pull request en el repositorio de GitHub.

---

### Nota
Este proyecto sigue las directrices establecidas en el manual de instrucciones de repositorios UVG.

