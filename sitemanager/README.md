# SiteSync

A construction site management application for UK construction sites (and beyond) with features for Site Diary, Snags, and Stock management.

## Features

- **Site Diary**: Daily site diary entries with photos, weather, worker count, and notes
- **Snags**: Track and manage site defects with priorities, status, and assignments
- **Stock Management**: Inventory management with quantity tracking, alerts, and transaction history
- **Authentication**: Google OAuth and Magic Link (email) authentication
- **Multi-user Support**: Multiple users can manage multiple construction sites

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + shadcn/ui components
- **Deployment**: IONOS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials (for Google sign-in)
- Email server credentials (for Magic Link)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sitemanager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL (e.g., `http://localhost:3000`)
- `NEXTAUTH_SECRET`: A random secret string
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- Email server configuration for Magic Link

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
sitemanager/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── site-diary/    # Site Diary module
│   │   ├── snags/         # Snags module
│   │   └── stock/         # Stock management
│   └── api/               # API Routes
├── components/            # React components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities and configurations
├── prisma/                # Prisma schema and migrations
└── types/                 # TypeScript type definitions
```

## Database Schema

The application uses Prisma with the following main models:
- **User**: User accounts and authentication
- **Site**: Construction sites
- **SiteDiary**: Daily diary entries
- **Snag**: Site defects/issues
- **StockItem**: Inventory items
- **StockTransaction**: Stock movement history

## Deployment on IONOS

1. **Prepare for deployment**:
   - Build the application: `npm run build`
   - Ensure all environment variables are set on IONOS

2. **IONOS Setup**:
   - Set up a VPS or hosting account
   - Install Node.js and PostgreSQL
   - Configure environment variables
   - Set up PM2 or similar for process management
   - Configure domain and SSL certificate

3. **Database**:
   - Create PostgreSQL database on IONOS
   - Run migrations: `npx prisma migrate deploy`
   - Generate Prisma client: `npx prisma generate`

4. **Deploy**:
   - Push code to GitHub
   - Pull on IONOS server
   - Install dependencies: `npm install --production`
   - Start application with PM2: `pm2 start npm --name "sitemanager" -- start`

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Database Migrations

- Create migration: `npx prisma migrate dev --name migration-name`
- Apply migrations: `npx prisma migrate deploy`
- View database: `npx prisma studio`

## Future Enhancements

- Photo upload functionality (currently placeholder)
- PDF export for Site Diary
- Mobile app (React Native/Expo)
- Advanced filtering and search
- Notifications and alerts
- Multi-site dashboard overview
- User roles and permissions

## License

[Add your license here]

## Support

[Add support information here]

