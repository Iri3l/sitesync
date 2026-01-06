# Ghid Rapid: Obține Connection String de la Supabase

## Pasul 1: Loghează-te în Supabase

1. Mergi la **https://supabase.com/**
2. Click pe **"Sign In"** (sau **"Start your project"** dacă nu ai cont)
3. Loghează-te cu:
   - GitHub
   - Google
   - Sau email + parolă

## Pasul 2: Accesează Proiectul

1. După logare, vei vedea dashboard-ul Supabase
2. Dacă ai deja un proiect, click pe el
3. Dacă nu ai proiect, click pe **"New Project"** și creează unul:
   - **Name**: `sitesync` (sau orice nume vrei)
   - **Database Password**: Alege o parolă puternică (SALVEAZĂ-O!)
   - **Region**: Alege cea mai apropiată regiune (ex: `West Europe`)
   - Click **"Create new project"**
   - Așteaptă ~2 minute

## Pasul 3: Obține Connection String

1. În dashboard-ul Supabase, în meniul din stânga, click pe **Settings** (iconița de roată ⚙️)
2. Click pe **Database** din submeniu
3. Scroll în jos până la secțiunea **"Connection string"**
4. Vei vedea mai multe tab-uri:
   - **URI** ← Selectează acesta!
   - Session mode
   - Transaction mode
   - etc.

5. În tab-ul **"URI"**, vei vedea connection string-ul:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   
   SAU
   
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

6. **Copiază connection string-ul complet**

## Pasul 4: Obține Parola (dacă ai uitat-o)

Dacă ai uitat parola bazei de date:

1. În același loc (Settings → Database)
2. Scroll până la **"Database password"**
3. Click pe **"Reset database password"**
4. Setează o parolă nouă (SALVEAZĂ-O!)
5. Connection string-ul se va actualiza automat

## Pasul 5: Actualizează .env

1. Deschide fișierul `.env` din proiectul tău
2. Găsește linia:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   ```

3. **Înlocuiește** cu connection string-ul copiat de la Supabase

4. **Important**: Dacă connection string-ul de la Supabase nu are `?pgbouncer=true&connection_limit=1` la sfârșit, adaugă-l:
   ```
   postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
   ```

## Pasul 6: Verifică

După ce ai actualizat `.env`, rulează:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Dacă migrațiile rulează fără erori, totul este configurat corect! ✅

## Exemplu Final

După actualizare, `.env` ar trebui să arate așa:

```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MySecurePassword123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="+PT8UH68+M3U9jYDSBYP2tv4yUAQdiA/B47UbY9Fowc="
```

## Troubleshooting

### "password authentication failed"
- Verifică că parola din connection string este corectă
- Poți reseta parola în Supabase: Settings → Database → Reset database password

### "connection timeout"
- Verifică că ai internet
- Verifică că proiectul Supabase este activ (nu e pausat)

### "relation does not exist"
- Rulează migrațiile: `npm run prisma:migrate`
- Verifică că ai rulat `npm run prisma:generate` înainte

