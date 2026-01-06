# Cum să Găsești Connection String în Supabase

## Metoda 1: Settings → Database (Recomandat)

1. **Loghează-te în Supabase** la https://supabase.com/dashboard

2. **Selectează proiectul tău** (dacă ai mai multe proiecte)

3. **În meniul din stânga**, click pe **Settings** (iconița de roată din stânga jos)

4. **Click pe "Database"** din submeniul Settings

5. **Scroll în jos** până vezi secțiunea **"Connection string"** sau **"Connection pooling"**

6. Vei vedea mai multe tab-uri:
   - **URI** (asta e ce ne trebuie!)
   - **JDBC**
   - **Golang**
   - etc.

7. **Click pe tab-ul "URI"**

8. **Copiază connection string-ul** - va arăta așa:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

## Metoda 2: Project Settings → Database

1. Click pe **Project Settings** (iconița de roată lângă numele proiectului, în partea de sus)

2. Click pe **Database** din meniul stâng

3. Caută secțiunea **"Connection string"** sau **"Connection info"**

4. Selectează tab-ul **"URI"**

5. Copiază connection string-ul

## Metoda 3: Project API Settings

1. Click pe **Settings** → **API**

2. Scroll până la **"Database"** sau **"Connection string"**

3. Copiază connection string-ul de acolo

## Dacă tot nu găsești:

### Opțiunea A: Construiește-l manual

Connection string-ul Supabase are formatul:
```
postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres
```

Pentru a-l construi:
1. Mergi la **Settings** → **Database**
2. Găsește **"Host"** (va arăta ca `db.xxxxx.supabase.co`)
3. Găsește **"Database password"** (parola pe care ai setat-o la crearea proiectului)
4. Construiește string-ul:
   ```
   postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
   ```

### Opțiunea B: Reset Database Password

Dacă nu știi parola:
1. Mergi la **Settings** → **Database**
2. Click pe **"Reset database password"**
3. Setează o parolă nouă (SALVEAZĂ-O!)
4. Folosește parola nouă în connection string

## Format Final pentru .env

După ce ai connection string-ul, adaugă-l în `.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

**Notă:** Adaugă `?pgbouncer=true&connection_limit=1` la sfârșit pentru conexiuni mai stabile.

## Screenshot Locations (unde să cauți):

- **Settings icon** (roată) → **Database** → Scroll jos → **"Connection string"**
- **Project Settings** (sus, lângă numele proiectului) → **Database**
- **Settings** → **API** → Scroll jos → **Database section**

## Dacă interfața Supabase arată diferit:

Supabase actualizează interfața periodic. Dacă nu găsești exact locațiile de mai sus:
1. Caută orice secțiune care menționează **"Connection"**, **"Database URL"**, sau **"Connection string"**
2. Sau folosește **Metoda 3** (construiește-l manual) cu informațiile din Settings → Database

