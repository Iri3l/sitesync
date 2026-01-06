# Setup IONOS MySQL - Configurare Completă

## Datele tale IONOS MySQL:

- **Host**: `db5019335483.hosting-data.io`
- **Port**: `3306`
- **Username**: `dbu2784141`
- **Password**: `Mysqldatabase1!`
- **Database Name**: `dbs15142579`

## 1. Creează fișierul .env

Creează un fișier `.env` în root-ul proiectului cu următorul conținut:

```env
# Database - IONOS MySQL
DATABASE_URL="mysql://dbu2784141:Mysqldatabase1%21@db5019335483.hosting-data.io:3306/dbs15142579"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="m9EjumBN8+osFdHUqR+cxHquXC7K3tmMcIYSrGn46YM="

# Google OAuth (optional - pentru Google sign-in)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (optional - pentru Magic Link)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@example.com"
```

**Notă importantă**: Parola conține `!` care trebuie URL-encodat ca `%21` în connection string.

## 2. Generează Prisma Client

După ce ai creat `.env` cu `DATABASE_URL` corect:

```bash
npm run prisma:generate
```

## 3. Rulează Migrațiile

Creează tabelele în baza de date IONOS:

```bash
npm run prisma:migrate
```

Aceasta va:
- Crea toate tabelele necesare în baza de date IONOS
- Rula migrațiile
- Verifica conexiunea

## 4. Verifică Conexiunea

Dacă migrațiile rulează fără erori, înseamnă că totul funcționează!

## 5. Pornește Aplicația

```bash
npm run dev
```

Vizitează http://localhost:3000

## Troubleshooting

### Eroare: "Access denied for user"
- Verifică că username și password sunt corecte
- Verifică că parola este URL-encodată corect (`!` → `%21`)

### Eroare: "Can't connect to MySQL server"
- Verifică că host-ul este corect
- Verifică că portul este 3306
- Verifică că baza de date există în IONOS
- Verifică firewall-ul (dacă e necesar, adaugă IP-ul tău în whitelist IONOS)

### Eroare: "Unknown database"
- Verifică că numele bazei de date (`dbs15142579`) este corect
- Verifică în IONOS Control Panel că baza de date există

## Notă despre NEXTAUTH_SECRET

Pentru producție, generează un secret nou și sigur:

```bash
openssl rand -base64 32
```

Copiază output-ul și înlocuiește `NEXTAUTH_SECRET` în `.env`.

