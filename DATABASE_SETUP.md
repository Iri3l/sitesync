# Ghid Complet pentru Setup Baza de Date

## Opțiuni pentru Baza de Date

### Opțiunea 1: PostgreSQL Local (Recomandat pentru dezvoltare)

Cel mai simplu mod pentru a începe este să instalezi PostgreSQL local pe computerul tău.

#### macOS:
```bash
# Folosind Homebrew
brew install postgresql@14
brew services start postgresql@14

# Creează baza de date
createdb sitemanager
```

#### Windows:
1. Descarcă PostgreSQL de la: https://www.postgresql.org/download/windows/
2. Instalează și urmează instrucțiunile
3. Creează baza de date folosind pgAdmin sau command line

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb sitemanager
```

**DATABASE_URL pentru local:**
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sitemanager?schema=public"
```
*Înlocuiește `your_password` cu parola ta PostgreSQL*

---

### Opțiunea 2: IONOS Database

Dacă ai deja un cont IONOS și vrei să folosești baza de date de la ei:

#### Unde găsești informațiile în IONOS:

1. **Loghează-te în IONOS Control Panel**
   - Mergi la https://www.ionos.com/
   - Loghează-te în contul tău

2. **Accesează secțiunea Database/MySQL/PostgreSQL**
   - În Control Panel, caută "Database" sau "MySQL" sau "PostgreSQL"
   - Dacă nu ai o bază de date creată, creează una nouă

3. **Informațiile de care ai nevoie:**
   - **Host/Server**: De obicei arată ca `db12345678.ionos.com` sau `postgresql.ionos.com`
   - **Port**: De obicei `5432` pentru PostgreSQL
   - **Database Name**: Numele bazei de date (ex: `db12345678` sau numele pe care l-ai dat)
   - **Username**: Numele utilizatorului (de obicei același cu database name)
   - **Password**: Parola pe care ai setat-o

4. **Format DATABASE_URL pentru IONOS:**
```env
DATABASE_URL="postgresql://username:password@host:5432/database_name?schema=public"
```

**Exemplu real:**
```env
DATABASE_URL="postgresql://db12345678:mypassword@postgresql.ionos.com:5432/db12345678?schema=public"
```

---

### Opțiunea 3: Servicii Cloud Gratuite (Pentru testare)

#### A. Supabase (Recomandat - gratuit și ușor)

1. Mergi la https://supabase.com/
2. Creează un cont gratuit
3. Creează un proiect nou
4. Mergi la **Settings** → **Database**
5. Copiază **Connection String** (URI)
6. Va arăta așa:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

#### B. Neon (Serverless PostgreSQL)

1. Mergi la https://neon.tech/
2. Creează un cont gratuit
3. Creează un proiect
4. Copiază connection string din dashboard

#### C. Railway

1. Mergi la https://railway.app/
2. Creează un cont
3. Adaugă un serviciu PostgreSQL
4. Copiază connection string din variabilele de mediu

#### D. Render

1. Mergi la https://render.com/
2. Creează un cont
3. Creează un PostgreSQL database
4. Copiază External Database URL

---

### Opțiunea 4: Docker (Dacă ai Docker instalat)

Cel mai simplu mod de a rula PostgreSQL local fără instalare:

```bash
# Rulează PostgreSQL în Docker
docker run --name sitemanager-postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=sitemanager \
  -p 5432:5432 \
  -d postgres:14

# DATABASE_URL
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/sitemanager?schema=public"
```

---

## Cum să găsești informațiile în IONOS (Pas cu Pas)

### Dacă ai deja o bază de date IONOS:

1. **Loghează-te în IONOS Control Panel**
   - https://www.ionos.com/ → Login

2. **Găsește secțiunea Database**
   - În meniul principal, caută "Database" sau "MySQL/PostgreSQL"
   - Sau mergi direct la: https://www.ionos.com/help/database/

3. **Accesează baza de date ta**
   - Click pe baza de date existentă
   - Sau creează una nouă dacă nu ai

4. **Vezi detaliile de conexiune**
   - Host/Server: De obicei în format `db12345678.ionos.com`
   - Port: `5432` (standard pentru PostgreSQL)
   - Database Name: Numele bazei de date
   - Username: Utilizatorul bazei de date
   - Password: Parola (dacă ai uitat-o, poți reseta)

5. **Dacă nu găsești PostgreSQL în IONOS:**
   - IONOS oferă mai des MySQL decât PostgreSQL
   - Poți folosi MySQL cu Prisma (trebuie să schimbăm provider-ul)
   - Sau folosește unul dintre serviciile cloud gratuite de mai sus

---

## Recomandare pentru Început

**Pentru dezvoltare și testare, recomand:**

1. **Supabase** (cel mai ușor) - https://supabase.com/
   - Cont gratuit
   - Setup în 5 minute
   - PostgreSQL complet funcțional
   - Interface web frumos

2. **Sau PostgreSQL local** dacă vrei să rulezi totul local

3. **IONOS** doar dacă ai deja un cont și vrei să folosești serviciile lor

---

## Verificare Conexiune

După ce ai setat `DATABASE_URL`, testează conexiunea:

```bash
# Rulează migrațiile
npm run prisma:migrate

# Dacă merge, înseamnă că conexiunea funcționează!
```

---

## Ajutor Suplimentar

Dacă ai probleme:
1. Verifică că baza de date rulează
2. Verifică că firewall-ul permite conexiunea
3. Pentru servicii remote, verifică că IP-ul tău este whitelisted (dacă e necesar)
4. Verifică că username și password sunt corecte

