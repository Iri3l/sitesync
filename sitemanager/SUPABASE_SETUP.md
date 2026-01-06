# Setup Supabase pentru Dezvoltare

## Pasul 1: Creează Cont Supabase

1. Mergi la https://supabase.com/
2. Click pe **"Start your project"** sau **"Sign up"**
3. Loghează-te cu GitHub, Google sau email
4. Confirmă email-ul dacă e necesar

## Pasul 2: Creează un Proiect Nou

1. După logare, click pe **"New Project"**
2. Completează:
   - **Name**: `sitemanager` (sau orice nume vrei)
   - **Database Password**: Alege o parolă puternică (SALVEAZĂ-O!)
   - **Region**: Alege cea mai apropiată regiune (ex: `West Europe`)
3. Click **"Create new project"**
4. Așteaptă ~2 minute până se creează proiectul

## Pasul 3: Obține Connection String

1. În dashboard-ul Supabase, mergi la **Settings** (iconița de roată din stânga jos)
2. Click pe **Database** din meniul stâng
3. Scroll până la secțiunea **"Connection string"**
4. Selectează tab-ul **"URI"**
5. Copiază connection string-ul (va arăta așa):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

## Pasul 4: Actualizează .env

Deschide fișierul `.env` și înlocuiește `DATABASE_URL` cu connection string-ul de la Supabase:

```env
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="m9EjumBN8+osFdHUqR+cxHquXC7K3tmMcIYSrGn46YM="

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (optional)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@example.com"
```

**Important:**
- Înlocuiește `[YOUR-PASSWORD]` cu parola pe care ai setat-o la crearea proiectului
- Sau folosește connection string-ul direct din Supabase (deja are parola inclusă)
- Adaugă `?pgbouncer=true&connection_limit=1` la sfârșit pentru conexiuni mai stabile

## Pasul 5: Generează Prisma Client

```bash
npm run prisma:generate
```

## Pasul 6: Rulează Migrațiile

```bash
npm run prisma:migrate
```

Aceasta va crea toate tabelele în baza de date Supabase.

## Pasul 7: Verifică în Supabase

1. Mergi înapoi în Supabase dashboard
2. Click pe **Table Editor** din meniul stâng
3. Ar trebui să vezi toate tabelele create: `User`, `Site`, `SiteDiary`, `Snag`, `StockItem`, etc.

## Pasul 8: Pornește Aplicația

```bash
npm run dev
```

Vizitează http://localhost:3000

## Avantaje Supabase

✅ **Gratuit** pentru dezvoltare (500MB database, 2GB bandwidth)  
✅ **PostgreSQL complet funcțional**  
✅ **Interface web frumos** pentru a vedea datele  
✅ **Fără configurare IP whitelist**  
✅ **Backup automat**  
✅ **SSL/TLS inclus**  

## Când să treci la IONOS

Când ești gata pentru producție:
1. Deploy aplicația pe IONOS hosting
2. Schimbă `DATABASE_URL` în `.env` de producție să folosească IONOS MySQL
3. Actualizează `prisma/schema.prisma` la `provider = "mysql"`
4. Rulează migrațiile pe baza de date IONOS

## Troubleshooting

### Eroare: "password authentication failed"
- Verifică că parola din connection string este corectă
- Poți reseta parola în Supabase: Settings → Database → Reset database password

### Eroare: "connection timeout"
- Verifică că ai internet
- Verifică că proiectul Supabase este activ (nu e pausat)

### Eroare: "relation does not exist"
- Rulează migrațiile: `npm run prisma:migrate`
- Verifică că ai rulat `npm run prisma:generate` înainte

