# TypeScript Development Quick Reference

## Common Commands

### Development

```bash
# Start server with hot reload (recommended)
npm run dev:watch

# Start server without watch mode
npm run dev
```

### Production

```bash
# Build TypeScript to JavaScript
npm run build

# Run production server
npm start
```

### Database

```bash
# Run all migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Run all seeders
npx sequelize-cli db:seed:all

# Undo all seeders
npx sequelize-cli db:seed:undo:all
```

## File Structure

```
server/
├── index.ts              # Server entry point
├── tsconfig.json         # TypeScript config
├── nodemon.json          # Nodemon config
├── types/
│   └── models.ts        # Shared type definitions
├── auth/
│   └── passport.ts      # JWT strategy
├── routes/              # API routes
│   ├── auth.ts
│   ├── bookshops.ts
│   ├── books.ts
│   ├── sales.ts
│   ├── reports.ts
│   └── dashboard.ts
└── db/
    ├── config/
    │   └── config.ts    # DB configuration
    ├── models/          # Sequelize models
    │   ├── index.ts
    │   ├── user.ts
    │   ├── bookshop.ts
    │   ├── book.ts
    │   ├── sale.ts
    │   └── saleitem.ts
    ├── migrations/      # DB migrations (JS)
    └── seeders/         # DB seeders (JS)
```

## Adding a New Route

1. Create route file: `routes/myroute.ts`

```typescript
import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    // Your logic here
    res.json({ message: "Success" });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

export = router;
```

2. Register in `index.ts`:

```typescript
const myRoute = require("./routes/myroute");
app.use(
  "/api/myroute",
  passport.authenticate("jwt", { session: false }),
  myRoute
);
```

## Adding a New Model

1. Add interface to `types/models.ts`:

```typescript
export interface MyModelAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MyModelCreationAttributes
  extends Optional<MyModelAttributes, "id"> {}

export class MyModel
  extends Model<MyModelAttributes, MyModelCreationAttributes>
  implements MyModelAttributes
{
  public id!: number;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
```

2. Create model file: `db/models/mymodel.ts`

```typescript
import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { MyModel } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<MyModel> => {
  MyModel.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "MyModel",
      tableName: "MyModels",
      timestamps: true,
    }
  );

  return MyModel;
};
```

3. Update `db/models/index.ts` interface:

```typescript
interface DB {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  User: ModelStatic<User>;
  // ... existing models
  MyModel: ModelStatic<MyModel>; // Add this
}
```

## Type Safety Tips

### Request Body Types

```typescript
interface CreateUserBody {
  username: string;
  password: string;
}

router.post(
  "/",
  async (
    req: Request<{}, {}, CreateUserBody>,
    res: Response
  ): Promise<void> => {
    const { username, password } = req.body; // Fully typed!
  }
);
```

### Query Parameters

```typescript
interface SearchQuery {
  search?: string;
  limit?: string;
}

router.get(
  "/",
  async (
    req: Request<{}, {}, {}, SearchQuery>,
    res: Response
  ): Promise<void> => {
    const { search, limit } = req.query; // Fully typed!
  }
);
```

### Route Parameters

```typescript
router.get(
  "/:id",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { id } = req.params; // Fully typed!
  }
);
```

## Common Patterns

### Error Handling

```typescript
try {
  // Your code
} catch (err) {
  const error = err as Error;
  res.status(500).json({ message: error.message });
}
```

### Database Queries

```typescript
const db = require("../db/models");
const { User, Book } = db;

// Find by primary key
const user = await User.findByPk(id);

// Find one
const user = await User.findOne({ where: { username } });

// Find all
const users = await User.findAll();

// Create
const user = await User.create({ username, password });

// Update
await User.update({ username }, { where: { id } });

// Delete
await User.destroy({ where: { id } });
```

### Transactions

```typescript
const db = require("../db/models");
const { sequelize } = db;

const t = await sequelize.transaction();
try {
  // Your operations with { transaction: t }
  await t.commit();
} catch (err) {
  await t.rollback();
  throw err;
}
```

## Debugging

### TypeScript Compilation Errors

```bash
# See all type errors
npm run build
```

### Runtime Debugging

```bash
# Run with source maps
npm run dev

# Debug in VS Code - use existing Node.js debugging
```

### Check Specific File

```bash
# Compile single file
npx tsc routes/auth.ts --noEmit
```

## Environment Variables

Required in `.env`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bookshop_db
DB_DIALECT=mysql

# JWT (REQUIRED - no fallback)
JWT_SECRET=your_secret_key

# Email (optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_password
EMAIL_FROM=noreply@example.com

# Server
PORT=5001
NODE_ENV=development
```

## Troubleshooting

### "Cannot find module" errors

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Sequelize CLI issues

```bash
# Ensure you've built first
npm run build

# Check .sequelizerc points to dist/
```

### Type errors in node_modules

```bash
# Add to tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

## Best Practices

1. **Always type your functions**

   - Use explicit return types
   - Type all parameters
   - Use `Promise<void>` for async route handlers

2. **Create interfaces for request bodies**

   - Define interfaces for POST/PUT request bodies
   - Use generics: `Request<params, resBody, reqBody, query>`

3. **Handle errors properly**

   - Always type catch blocks: `const error = err as Error`
   - Return typed error responses

4. **Use the type system**

   - Don't use `any` unless absolutely necessary
   - Leverage inference where appropriate
   - Create reusable type definitions

5. **Keep types organized**
   - Shared types go in `types/` directory
   - Route-specific types can be defined in route files
   - Model types go in `types/models.ts`
