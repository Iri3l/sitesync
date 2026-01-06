# Prisma Setup Instructions

## Issue
If you're encountering Prisma 7.x errors when running `npx prisma`, it's because `npx` is using a globally installed Prisma 7.x instead of the local Prisma 5.x specified in `package.json`.

## Solution

### Option 1: Use Local Prisma Version (Recommended)

After installing dependencies, use the local Prisma version:

```bash
# Install dependencies first
npm install

# Then use the local Prisma version
./node_modules/.bin/prisma generate
./node_modules/.bin/prisma migrate dev

# Or add scripts to package.json and use:
npm run prisma:generate
npm run prisma:migrate
```

### Option 2: Use npm scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

Then run:
```bash
npm run prisma:generate
npm run prisma:migrate
```

### Option 3: Upgrade to Prisma 7.x (Advanced)

If you want to use Prisma 7.x, you'll need to:

1. Update `package.json`:
```json
{
  "dependencies": {
    "@prisma/client": "^7.2.0"
  },
  "devDependencies": {
    "prisma": "^7.2.0"
  }
}
```

2. Create `prisma.config.ts`:
```typescript
import { defineConfig } from "prisma"

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
```

3. Remove `url` from `prisma/schema.prisma` datasource block

4. Update `lib/prisma.ts` to use Prisma 7.x adapter pattern

## Recommended Approach

For this project, we recommend using **Option 1** or **Option 2** to stick with Prisma 5.x, which is more stable and widely compatible with NextAuth.js and other dependencies.

