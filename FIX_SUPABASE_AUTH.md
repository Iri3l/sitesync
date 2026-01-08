# Fix Eroare Autentificare Supabase

## Eroarea: "Authentication failed"

Această eroare apare când parola din connection string nu este corectă sau nu este URL-encodată corect.

## Soluții:

### 1. Verifică Parola în Supabase

1. Mergi la **Settings** → **Database**
2. Caută secțiunea **"Database password"** sau **"Reset database password"**
3. Dacă nu știi parola, click pe **"Reset database password"**
4. Setează o parolă nouă (SALVEAZĂ-O!)

### 2. Format Corect Connection String

Connection string-ul trebuie să arate așa:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.ymgltxgmlgwgizqfapvd.supabase.co:5432/postgres"
```

**Important:**
- Înlocuiește `YOUR_PASSWORD` cu parola reală (fără `[` și `]`)
- Dacă parola conține caractere speciale, trebuie URL-encodate:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - `&` → `%26`
  - `+` → `%2B`
  - `=` → `%3D`
  - `?` → `%3F`
  - `/` → `%2F`
  - ` ` (spațiu) → `%20`

### 3. Exemplu cu Parolă Complexă

Dacă parola ta este: `MyP@ssw0rd#123`

Connection string-ul ar trebui să fie:
```env
DATABASE_URL="postgresql://postgres:MyP%40ssw0rd%23123@db.ymgltxgmlgwgizqfapvd.supabase.co:5432/postgres"
```

### 4. Metodă Simplă: Folosește Connection Pooling

Supabase oferă și connection pooling care este mai stabil. În Settings → Database, caută:
- **Connection pooling** sau
- **Session mode** connection string

Acesta arată așa:
```
postgresql://postgres.ymgltxgmlgwgizqfapvd:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### 5. Verifică în Supabase Dashboard

1. Mergi la **Settings** → **Database**
2. Caută **"Connection string"** sau **"Connection info"**
3. Click pe tab-ul **"URI"**
4. Copiază EXACT connection string-ul de acolo (nu construi-l manual)

### 6. Testează Connection String-ul

Poți testa connection string-ul cu `psql` (dacă ai instalat PostgreSQL):

```bash
psql "postgresql://postgres:YOUR_PASSWORD@db.ymgltxgmlgwgizqfapvd.supabase.co:5432/postgres"
```

Sau folosește un tool online pentru a testa conexiunea.

## Pași Rapizi:

1. **Resetează parola** în Supabase: Settings → Database → Reset database password
2. **Copiază connection string-ul direct** din Supabase (nu-l construi manual)
3. **Pune-l în .env** exact cum este
4. **Rulează din nou**: `npm run prisma:migrate`

## Format Final Recomandat:

```env
DATABASE_URL="postgresql://postgres.ymgltxgmlgwgizqfapvd:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Sau dacă folosești direct connection:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.ymgltxgmlgwgizqfapvd.supabase.co:5432/postgres"
```

**Notă:** Înlocuiește `[YOUR-PASSWORD]` cu parola reală (fără paranteze pătrate).



