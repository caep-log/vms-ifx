# Frontend | React + TypeScript

Frontend application built with **React 19, TypeScript and Vite**, focused on providing a responsive and modular interface for VM management.

---

## Technologies

- **React 19** — UI library
- **TypeScript** — Static typing
- **Vite** — Development server and build tool
- **React Router** — Client-side routing
- **Sass** — Component and application styling
- **Chart.js** — Data visualization
- **Lucide React** — Icons
- **Axios** — HTTP client
- **UUID** — Unique identifier generation
- **ESLint** — Code quality and linting

---

## Project Structure

The frontend follows a **feature-based structure**, separating application features from shared components and infrastructure.

```text
src/
└── assets/
    ├── app/
    ├── features/
    │   ├── auth/
    │   ├── dashboard/
    │   │   └── bento-grid/
    │   ├── notFound/
    │   ├── public/
    │   └── vms/
    ├── infrastructure/
    │   └── http/
    └── shared/
        ├── components/
        │   ├── button/
        │   ├── input/
        │   ├── loading/
        │   ├── skeleton/
        │   ├── table/
        │   └── text/
        ├── types/
        └── utils/
```

### Features

The `features` directory contains functionality grouped by business domain.

- **auth/** — Authentication and user session management.
- **dashboard/** — Main dashboard and VM metrics visualization.
- **dashboard/bento-grid/** — Dashboard cards and visual data components.
- **vms/** — VM management functionality.
- **public/** — Public-facing views.
- **notFound/** — 404 page and handling.

This structure keeps feature-specific logic together and makes the application easier to scale.

### Shared Components

The `shared/components` directory contains reusable UI components created for use throughout the application.

Examples:

- Button
- Input
- Text
- Table
- Loading
- Skeleton

The components were **built from scratch** rather than relying on a UI component library.

This was intentional to demonstrate the implementation of reusable components, including their:

- Structure
- Props
- TypeScript types
- Styling
- States
- Reusability

This approach also provides greater control over the visual design and behavior of the application.

---

## Application Architecture

The frontend separates UI, features, shared resources and infrastructure.

```text
┌───────────────────────────────┐
│            App                │
│      Routing / Application    │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│           Features            │
│ Auth / Dashboard / VMs / etc. │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│      Shared Components        │
│ Button / Input / Table / etc. │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       Infrastructure          │
│          HTTP / Axios         │
└───────────────┬───────────────┘
                │
                ▼
             Backend
```

---

## Frontend ↔ Backend Communication

The frontend communicates with the backend through a REST API.

HTTP communication is centralized under:

```text
src/assets/infrastructure/http/
```

**Axios** is used as the HTTP client to perform API requests.

The general flow is:

```text
User Interaction
       │
       ▼
   React Feature
       │
       ▼
   HTTP Client
      Axios
       │
       ▼
    REST API
       │
       ▼
    Backend
       │
       ▼
    Response
       │
       ▼
   React State
       │
       ▼
    UI Update
```

This separation prevents API communication logic from being tightly coupled to individual UI components.

---

## Routing

**React Router** is used to manage client-side navigation and application routes.

The application separates public and protected functionality, allowing different views to be rendered depending on the user's current application state and access level.

---

## Data Visualization

**Chart.js** is used to display dynamic VM-related metrics in the dashboard.

Charts are integrated into the dashboard to provide a visual representation of resource allocation, such as:

- Total allocated vCPU
- Total allocated RAM
- Total allocated disk
- VM activity and capacity

The dashboard combines these visualizations with reusable UI components to provide a quick overview of the infrastructure.

---

## Styling

The application uses **Sass (SCSS)** for styling.

Styles are organized alongside their corresponding components and features, allowing each part of the application to maintain its own visual rules while still supporting reusable patterns.

The UI was implemented without depending on a third-party component library, giving the application full control over:

- Layout
- Responsive behavior
- Colors
- Spacing
- Typography
- Component states
- Dark mode

---

## Dependencies

### Runtime Dependencies

| Dependency | Purpose |
|---|---|
| `react` | UI development |
| `react-dom` | React DOM rendering |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP requests |
| `chart.js` | Data visualization |
| `lucide-react` | Icons |
| `sass` | SCSS styling |
| `uuid` | Unique identifier generation |
| `prop-types` | Runtime prop validation |

### Development Dependencies

| Dependency | Purpose |
|---|---|
| `typescript` | Static typing |
| `vite` | Development and build tooling |
| `@vitejs/plugin-react` | React integration with Vite |
| `eslint` | Code quality |
| `eslint-plugin-react-hooks` | React Hooks linting |
| `eslint-plugin-react-refresh` | React Fast Refresh linting |
| `typescript-eslint` | TypeScript support for ESLint |
| `@types/react` | React TypeScript definitions |
| `@types/react-dom` | React DOM TypeScript definitions |
| `@types/node` | Node.js TypeScript definitions |

---

## Design Decisions

### Component creation

The UI components were implemented from scratch instead of using a pre-built component library.

The objective was to demonstrate the ability to design and implement reusable React components while maintaining consistent behavior and styling throughout the application.

### Feature-based organization

Features are organized by business domain instead of placing all components, hooks and logic into generic folders.

This makes the project easier to navigate and allows new functionality to be added without creating a highly coupled structure.

### Separation of HTTP communication

API communication is isolated inside the infrastructure layer.

This keeps React components focused on presentation and application behavior instead of directly managing HTTP configuration and request implementation.

---

## Running the Frontend

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the application:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

The development server is normally available at:

```text
http://localhost:5173
```