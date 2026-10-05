# Backend | Node.js + TypeScript

Backend REST API built with **Node.js, TypeScript and Express**.

**Local API:** `http://localhost:3000`

---

## Architecture

The backend follows a **Layered Architecture** to separate responsibilities and keep the codebase maintainable and easy to extend.

```text
src/
├── controllers/    # Handle HTTP requests and responses
├── routes/         # API route definitions
├── services/       # Business logic
├── repositories/   # Data access layer
├── schemas/        # Request validation schemas
├── middlewares/    # Middleware and request processing
├── types/          # TypeScript types and interfaces
└── config/         # Application configuration
```

### Request Flow

```text
HTTP Request
     │
     ▼
   Route
     │
     ▼
 Controller
     │
     ▼
  Service
     │
     ▼
 Repository
     │
     ▼
 DynamoDB
```

Each layer has a specific responsibility:

- **Routes:** Define available API endpoints.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Contain business rules and application logic.
- **Repositories:** Handle data persistence and DynamoDB operations.
- **Schemas:** Validate incoming data.
- **Middlewares:** Handle cross-cutting concerns such as authentication and errors.

---

## Design Patterns

### Dependency Injection

Dependencies are injected into services and other components instead of being tightly coupled to concrete implementations.

This makes the code easier to:

- Test
- Maintain
- Replace
- Extend

### Repository Pattern

The Repository Pattern abstracts the data access layer from the business logic.

The service does not need to know how DynamoDB operations are implemented. It interacts with the repository through its defined methods.

---

## Authentication & Authorization

The authentication design was intended to use **Amazon Cognito through LocalStack**.

The architecture separates authentication from application user data:

```text
Client
   │
   │ Email + Password
   ▼
Cognito
   │
   │ Identity / User Sub
   ▼
DynamoDB
   │
   └── User profile + application data
```

### Authentication

Cognito is responsible for validating the user's identity and credentials.

### Authorization

JWT tokens are used to identify the authenticated user and support role-based authorization.

Application roles:

- **Admin**
- **Client**

DynamoDB stores the application-specific user information associated with the Cognito identity.

---

## Validation

Request validation is handled using **Zod**.

Schemas define the expected structure and types of incoming data before it reaches the business logic.

Example:

```text
HTTP Request
     │
     ▼
  Zod Schema
     │
 ┌───┴───┐
 │       │
Valid   Invalid
 │       │
 ▼       ▼
Service  400
```

---

## Error Handling

The API uses standard HTTP status codes:

| Status | Meaning |
|---|---|
| `200` | Successful request |
| `201` | Resource created |
| `400` | Invalid request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Resource not found |
| `409` | Conflict |
| `500` | Internal server error |

---

## Why this architecture?

The main goal was to keep the backend **simple, clear and maintainable** while separating HTTP handling, business logic and data access.

The layered architecture provides a clear flow:

```text
Controller → Service → Repository
```

This makes it easier to:

- Change the persistence layer without affecting business logic.
- Test services independently.
- Keep controllers focused on HTTP concerns.
- Add new business rules without making controllers complex.
- Scale the project as new features are added.

For authentication and authorization, the design separates **identity management** from **application user data**, allowing Cognito to handle authentication while DynamoDB manages application-specific information such as roles and profiles.

---

## Running the Backend

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```