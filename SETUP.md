# Setup Instructions

## 1. Create .env file

Create a `.env` file in the root directory with the following content:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sitemanager?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"

# Google OAuth (optional - for Google sign-in)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (optional - for Magic Link)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@example.com"
```

### Quick Setup Commands

```bash
# Create .env file (copy and paste the content above, or use this command)
cat > .env << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/sitemanager?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@example.com"
EOF
```

## 2. Update DATABASE_URL

Replace the DATABASE_URL with your actual PostgreSQL connection string:

- **Local PostgreSQL**: `postgresql://username:password@localhost:5432/sitemanager?schema=public`
- **IONOS/Remote**: `postgresql://username:password@host:5432/database?schema=public`

## 3. Generate NEXTAUTH_SECRET

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` in your `.env` file.

## 4. Run Prisma Migrations

After setting up your `.env` file:

```bash
npm run prisma:migrate
```

This will:
- Create the database schema
- Run all migrations
- Generate the Prisma Client

## 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Optional: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

## Optional: Email Setup (for Magic Link)

Configure your email provider settings in `.env`. Common providers:

- **Gmail**: Use App Password (not regular password)
- **SendGrid**: Use SMTP settings from SendGrid dashboard
- **IONOS Email**: Use IONOS SMTP settings

## Troubleshooting

### DATABASE_URL not found
- Make sure `.env` file exists in the root directory
- Check that `DATABASE_URL` is set correctly
- No quotes needed if the URL doesn't contain special characters

### Prisma connection errors
- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists (Prisma will create schema, but database must exist)

### NextAuth errors
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your app URL
- For production, update `NEXTAUTH_URL` to your domain

