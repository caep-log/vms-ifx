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
cd docker
docker compose down
```
