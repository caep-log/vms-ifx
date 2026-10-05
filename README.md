# IFX Networks

## Tecnologías

- React 19
- TypeScript
- Vite
- React Router
- Sass
- Chart.js
- Lucide React
- Node.js
- Express 5
- Zod
- JSON Web Token (JWT)
- AWS SDK for JavaScript
- DynamoDB
- Amazon Cognito preparado para futura integración
- LocalStack
- Docker Compose

## Requisitos

- Node.js 20 o superior
- npm
- Docker Desktop
- Docker Compose

## IMPORTANTE
Necesitamos Docker*

## Ejecución rápida

Desde la raíz del proyecto, instala las dependencias una sola vez:

```powershell
npm install
npm --prefix backend install
npm --prefix frontend install
```

Si todavía no existe el entorno del backend:

```powershell
Copy-Item backend/.env.example backend/.env
```

Luego ejecuta todo con un único comando:

```powershell
npm run dev
```

Este comando levanta LocalStack, ejecuta `docker/init-aws.sh`, crea las tablas y los usuarios iniciales, y arranca el backend y el frontend.

Usuarios iniciales:

```text
Admin:  admin@example.com / Admin123!
Client: client@example.com / Client123!
```

## Ejecución desde cero

### 1. Iniciar LocalStack

Desde la raíz del proyecto:

```powershell
cd docker
docker compose up -d
docker compose ps
```

LocalStack quedará disponible en:

```text
http://localhost:4566
```

### 2. Configurar y ejecutar el backend

En otra terminal:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

El backend quedará disponible en:

```text
http://localhost:3000
```

### 3. Instalar y ejecutar el frontend

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

El frontend quedará disponible en la URL que muestre Vite, normalmente:

```text
http://localhost:5173
```

## Scripts

### Backend

```powershell
npm run dev
npm run build
npm start
```

### Frontend

```powershell
npm run dev
npm run build
npm run lint
npm run preview
```

## Detener LocalStack

```powershell
npm run docker:down
```
