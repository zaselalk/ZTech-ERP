# Copilot Instructions for BookShop Management System

## Project Overview

This is a bookshop management system with a React frontend (Vite) and Node.js backend (Express + Sequelize). The application manages bookshops, book inventory, sales, and provides reporting and dashboard features.

## Architecture

### Frontend (Client)
- **Framework:** React 19 with Vite
- **UI Library:** Ant Design (antd)
- **Routing:** React Router DOM
- **State Management:** React hooks (useState, useEffect)
- **Charts:** Chart.js with react-chartjs-2
- **Build Tool:** Vite
- **Linting:** ESLint with React hooks plugin

### Backend (Server)
- **Runtime:** Node.js with Express 5
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT with Passport.js
- **Email:** Nodemailer
- **Password Hashing:** bcrypt

## Project Structure

```
BookShop-Gemini/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   └── features/   # Feature-specific components
│   │   │       └── {feature_name}/  # Organized by feature
│   │   ├── pages/         # Page-level components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   ├── .env               # Environment variables (VITE_API_URL)
│   └── package.json
├── server/                # Node.js backend
│   ├── auth/             # Authentication logic (Passport)
│   ├── db/               # Database
│   │   ├── models/       # Sequelize models
│   │   ├── migrations/   # Database migrations
│   │   └── seeders/      # Database seeders
│   ├── routes/           # API route handlers
│   ├── .env              # Environment variables
│   └── index.js          # Server entry point
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
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Server Commands
```bash
cd server
npm run dev      # Start with nodemon
npm start        # Start production server
```

## Code Conventions

### File Organization
- Place feature-specific components in `client/src/components/features/{feature_name}/` subdirectories
- Keep page-level components in `client/src/pages/`
- Use clear, descriptive names for components and files
- Dashboard feature components may use mixed file extensions (.tsx and .jsx)

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
- Use `api.fetch` utility wrapper for API calls instead of native fetch
- This wrapper includes authentication headers automatically
- API base URL is configured via `VITE_API_URL` environment variable
- Default: `http://localhost:5001/api`

Example:
```javascript
import { api } from '../utils';

const response = await api.fetch(`${import.meta.env.VITE_API_URL}/endpoint`);
```

### Backend API Routes
- All API routes are prefixed with `/api`
- Routes require JWT authentication (except `/api/auth`)
- Use Passport.js middleware: `passport.authenticate('jwt', { session: false })`

Available endpoints:
- `/api/auth` - Authentication (login, register)
- `/api/bookshops` - Bookshop management
- `/api/books` - Book inventory
- `/api/sales` - Sales transactions
- `/api/reports` - Reporting data
- `/api/dashboard` - Dashboard statistics

## Database

### ORM: Sequelize
- Models are in `server/db/models/`
- Migrations in `server/db/migrations/`
- Use Sequelize CLI for migrations: `npx sequelize-cli`

### Models
- `User` - User accounts
- `Bookshop` - Bookshop locations
- `Book` - Book inventory
- `Sale` - Sales transactions
- `SaleItem` - Individual items in sales

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
- Use `formatCurrency` utility from `client/src/utils.js`
- Currency symbol: 'Rs.' (Sri Lankan Rupees)
- Format: `Rs. 1,234.56`

Example:
```javascript
import { formatCurrency } from '../utils';
const price = formatCurrency(1234.56); // Returns "Rs. 1,234.56"
```

## Testing

Currently, the project has no test infrastructure. When adding tests:
- Use Jest for backend testing
- Use React Testing Library for frontend testing
- Place tests adjacent to source files with `.test.js` or `.spec.js` extensions
- Follow AAA pattern (Arrange, Act, Assert)

## Common Tasks

### Adding a New Feature
1. Create component in `client/src/components/features/{feature_name}/`
2. Add route in `client/src/App.jsx`
3. Create backend route in `server/routes/{feature_name}.js`
4. Register route in `server/index.js`
5. Update database models if needed
6. Create migration if database changes required

### Adding a New Model
1. Create model file in `server/db/models/`
2. Define associations in model
3. Create migration: `npx sequelize-cli migration:generate --name create-model-name`
4. Edit migration file with schema
5. Run migration: `npx sequelize-cli db:migrate`

### Debugging
- Use browser DevTools for frontend debugging
- Use `console.log()` or Node.js debugger for backend
- Check browser Network tab for API call issues
- Review server logs for backend errors

## Dependencies

### Key Frontend Dependencies
- React 19.1.1
- Ant Design 5.27.6
- React Router DOM 7.9.4
- Chart.js 4.5.1
- Vite 7.1.7

### Key Backend Dependencies
- Express 5.1.0
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
