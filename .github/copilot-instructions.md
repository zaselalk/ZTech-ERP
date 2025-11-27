# Copilot Instructions for BookShop Management System

## Project Overview

This is a bookshop management system with a React + TypeScript frontend (Vite) and Node.js + TypeScript backend (Express + Sequelize). The application manages bookshops, book inventory, sales, and provides reporting and dashboard features.

## Architecture

### Frontend (Client)
- **Framework:** React 19 with Vite and TypeScript
- **UI Library:** Ant Design 6 (antd)
- **Styling:** Tailwind CSS with PostCSS
- **HTTP Client:** Axios with custom ApiClient wrapper
- **Routing:** React Router DOM
- **State Management:** React hooks (useState, useEffect)
- **Charts:** Chart.js with react-chartjs-2
- **Build Tool:** Vite with TypeScript
- **Linting:** ESLint with TypeScript-ESLint and React hooks plugin

### Backend (Server)
- **Runtime:** Node.js with Express 5 and TypeScript
- **Development:** ts-node for running TypeScript directly
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT with Passport.js
- **Email:** Nodemailer
- **Password Hashing:** bcrypt

## Project Structure

```
BookShop-Gemini/
├── client/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components (.tsx)
│   │   │   └── features/   # Feature-specific components
│   │   │       └── dashboard/  # Dashboard feature components
│   │   ├── pages/         # Page-level components (.tsx)
│   │   ├── services/      # API service modules
│   │   │   ├── authService.ts
│   │   │   ├── bookService.ts
│   │   │   ├── bookshopService.ts
│   │   │   ├── dashboardService.ts
│   │   │   ├── reportService.ts
│   │   │   ├── salesService.ts
│   │   │   └── index.ts   # Service exports
│   │   ├── utils/         # Utility functions
│   │   │   └── api.ts     # Axios-based ApiClient
│   │   ├── types.ts       # Shared TypeScript interfaces
│   │   ├── utils.ts       # Formatting utilities
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Application entry point
│   ├── tsconfig.json      # TypeScript configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── .env               # Environment variables (VITE_API_URL)
│   └── package.json
├── server/                # Node.js + TypeScript backend
│   ├── auth/             # Authentication logic
│   │   └── passport.ts   # Passport JWT strategy
│   ├── config/           # Configuration modules
│   │   ├── cors.ts       # CORS configuration
│   │   └── env.ts        # Environment validation
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.ts
│   │   └── requireAuth.ts
│   ├── db/               # Database
│   │   ├── config/       # Sequelize configuration
│   │   ├── models/       # Sequelize models (.ts)
│   │   ├── migrations/   # Database migrations
│   │   └── seeders/      # Database seeders
│   ├── routes/           # API route handlers (.ts)
│   │   ├── index.ts      # Route registration
│   │   ├── auth.ts
│   │   ├── books.ts
│   │   ├── bookshops.ts
│   │   ├── dashboard.ts
│   │   ├── reports.ts
│   │   └── sales.ts
│   ├── types/            # TypeScript type definitions
│   │   └── models.ts     # Model interfaces and classes
│   ├── index.ts          # Server entry point
│   ├── app.ts            # Express app configuration
│   ├── server.ts         # Server startup logic
│   ├── tsconfig.json     # TypeScript configuration
│   ├── .env              # Environment variables
│   └── package.json
└── package.json          # Root package with dev scripts
```

## Development Workflow

### Getting Started
```bash
# Install all dependencies (client + server)
npm install

# Run both dev servers (backend on :5001, frontend on :5173)
npm run dev
```

### Client Commands
```bash
cd client
npm run dev      # Start Vite dev server
npm run build    # TypeScript compile and build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Server Commands
```bash
cd server
npm run dev         # Start with ts-node
npm run dev:watch   # Start with nodemon and ts-node (auto-restart)
npm run build       # Compile TypeScript to dist/
npm start           # Start production server (from dist/)
npm run migrate     # Run database migrations
npm run seed        # Run database seeders
```

## Code Conventions

### File Organization
- Use `.tsx` for React components and `.ts` for other TypeScript files
- Place feature-specific components in `client/src/components/features/{feature_name}/` subdirectories
- Keep page-level components in `client/src/pages/`
- Use service modules in `client/src/services/` for API calls
- Define shared TypeScript interfaces in `client/src/types.ts`
- Use clear, descriptive names for components and files

### TypeScript Style
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper type annotations for function parameters and returns
- Import types using `type` keyword when appropriate: `import type { ... }`
- Use generics for reusable type patterns

### JavaScript/React Style
- Use ES6+ syntax and features
- Prefer functional components with hooks over class components
- Use destructuring for props and imports
- Follow ESLint configuration (see `client/eslint.config.js`)
- Unused variables starting with uppercase or underscore are allowed

### Code Quality
- Always use proper error handling with try-catch blocks
- Validate user inputs before processing
- Use async/await for asynchronous operations
- Keep functions focused and single-purpose
- Add comments only when necessary to explain complex logic

## API Communication

### Frontend API Calls
- Use the centralized service modules in `client/src/services/` for API calls
- Services use the axios-based `ApiClient` wrapper from `client/src/utils/api.ts`
- The ApiClient automatically:
  - Adds authentication headers (Bearer token from localStorage)
  - Handles 401 responses by redirecting to login
- API base URL is configured via `VITE_API_URL` environment variable
- Default: `http://localhost:5001/api`

#### Using Services
```typescript
import { bookService, salesService, authService } from '../services';

// Get all books
const books = await bookService.getBooks();

// Create a sale
const sale = await salesService.createSale(saleData);

// Login
const { token } = await authService.login(username, password);
authService.storeToken(token);
```

#### Direct API Access (when needed)
```typescript
import api from '../utils/api';

const response = await api.fetch<DataType>(`${import.meta.env.VITE_API_URL}/endpoint`, {
  method: 'POST',
  data: payload,
});
```

### Backend API Routes
- All API routes are prefixed with `/api`
- Routes require JWT authentication (except `/api/auth`)
- Use `requireAuth` middleware from `middleware/requireAuth.ts`
- Routes are registered centrally in `routes/index.ts`

Available endpoints:
- `/api/auth` - Authentication (login, register)
- `/api/bookshops` - Bookshop management
- `/api/books` - Book inventory
- `/api/sales` - Sales transactions
- `/api/reports` - Reporting data
- `/api/dashboard` - Dashboard statistics

## Database

### ORM: Sequelize
- Models are in `server/db/models/` (TypeScript files)
- Model type definitions in `server/types/models.ts`
- Migrations in `server/db/migrations/`
- Use Sequelize CLI for migrations: `npx sequelize-cli`

### Models
- `User` - User accounts (UserAttributes interface)
- `Bookshop` - Bookshop locations (BookshopAttributes interface)
- `Book` - Book inventory (BookAttributes interface)
- `Sale` - Sales transactions (SaleAttributes interface)
- `SaleItem` - Individual items in sales (SaleItemAttributes interface)

### Type Definitions
The `server/types/models.ts` file contains:
- Attribute interfaces (e.g., `UserAttributes`, `BookAttributes`)
- Creation attribute types (e.g., `UserCreationAttributes`)
- Model class definitions extending Sequelize's `Model`

### Database Configuration
Configure in `server/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=bookshop_db
DB_DIALECT=mysql
```

## Security Best Practices

### Critical Security Requirements
1. **Never commit sensitive data** to version control
2. **JWT_SECRET must be set** in environment variables (no fallback)
3. **Validate all user inputs** before processing
4. **Use parameterized queries** (Sequelize handles this)
5. **Hash passwords** using bcrypt before storing
6. **Use HTTPS** in production
7. **Sanitize user inputs** to prevent XSS attacks
   - React JSX provides built-in XSS protection for rendering
   - For raw HTML rendering, use DOMPurify library
   - Validate and sanitize data on the backend before storing
8. **Implement proper CORS configuration** in production

### Environment Variables
- Always use `.env` files for configuration
- Never commit `.env` files to git
- Use `.env.example` files to document required variables
- Client: Use `VITE_` prefix for environment variables accessible in frontend

## Localization & Formatting

### Currency Display
- Use `formatCurrency` utility from `client/src/utils.ts`
- Currency symbol: 'Rs.' (Sri Lankan Rupees)
- Format: `Rs. 1,234.56`

Example:
```typescript
import { formatCurrency } from '../utils';
const price = formatCurrency(1234.56); // Returns "Rs. 1,234.56"
```

## TypeScript Configuration

### Client (Vite + React)
- Target: ES2020 with DOM libraries
- Module: ESNext with bundler module resolution
- Strict mode enabled
- JSX: react-jsx transform
- See `client/tsconfig.json` for full configuration

### Server (Node.js)
- Target: ES2020
- Module: CommonJS
- Output directory: `dist/`
- Strict mode enabled
- See `server/tsconfig.json` for full configuration

## Testing

Currently, the project has no test infrastructure. When adding tests:
- Use Jest for backend testing
- Use React Testing Library for frontend testing
- Place tests adjacent to source files with `.test.ts` or `.spec.ts` extensions
- Follow AAA pattern (Arrange, Act, Assert)

## Common Tasks

### Adding a New Feature
1. Create TypeScript component in `client/src/components/features/{feature_name}/`
2. Add route in `client/src/App.tsx`
3. Create service module in `client/src/services/{feature_name}Service.ts`
4. Export service from `client/src/services/index.ts`
5. Create backend route in `server/routes/{feature_name}.ts`
6. Register route in `server/routes/index.ts`
7. Update database models/types if needed
8. Create migration if database changes required

### Adding a New Model
1. Define interfaces in `server/types/models.ts`
2. Create model file in `server/db/models/`
3. Define associations in model
4. Create migration: `npx sequelize-cli migration:generate --name create-model-name`
5. Edit migration file with schema
6. Run migration: `npx sequelize-cli db:migrate`

### Adding a New Service (Frontend)
1. Create service file in `client/src/services/{name}Service.ts`
2. Import api client: `import api from '../utils/api';`
3. Define API URL: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';`
4. Export service functions
5. Add export to `client/src/services/index.ts`

### Debugging
- Use browser DevTools for frontend debugging
- Use `console.log()` or Node.js debugger for backend
- Check browser Network tab for API call issues
- Review server logs for backend errors
- Use TypeScript's type checking to catch errors early

## Dependencies

### Key Frontend Dependencies
- React 19.1.1
- TypeScript 5.9
- Ant Design 6.0.0
- Axios 1.13.2
- React Router DOM 7.9.4
- Chart.js 4.5.1
- Vite 7.1.7
- Tailwind CSS 4.1.17

### Key Backend Dependencies
- Express 5.1.0
- TypeScript 5.9.3
- ts-node 10.9.2
- Sequelize 6.37.7
- Passport 0.7.0 + Passport-JWT 4.0.1
- bcrypt 6.0.0
- jsonwebtoken 9.0.2
- mysql2 3.15.3

## Additional Notes

- The main branch is the production branch
- Use meaningful commit messages
- Keep PRs focused on single features or fixes
- Update documentation when changing functionality
- Consider the `improvement.md` file for known issues and technical debt
- Both client and server use TypeScript with strict mode enabled
