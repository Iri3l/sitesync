# Troubleshooting Conexiune IONOS MySQL

## Eroare: "Can't reach database server"

Această eroare apare când Prisma nu poate conecta la baza de date IONOS. Iată soluțiile:

### 1. Verifică DATABASE_URL în .env

Asigură-te că `.env` conține:

```env
DATABASE_URL="mysql://dbu2784141:Mysqldatabase1%21@db5019335483.hosting-data.io:3306/dbs15142579"
```

**Important:**
- Parola conține `!` care trebuie URL-encodat ca `%21`
- Nu folosi ghilimele duble în jurul valorii (sau folosește-le corect)
- Fără spații în jurul `=`

### 2. Whitelist IP în IONOS (FOARTE IMPORTANT)

IONOS blochează conexiunile din afara IP-urilor whitelisted. Trebuie să adaugi IP-ul tău:

#### Cum să găsești IP-ul tău:
```bash
# În terminal, rulează:
curl ifconfig.me
# sau
curl ipinfo.io/ip
```

#### Cum să adaugi IP-ul în IONOS:
1. Loghează-te în IONOS Control Panel
2. Mergi la secțiunea **Database** sau **MySQL**
3. Găsește opțiunea **Remote Access** sau **IP Whitelist**
4. Adaugă IP-ul tău public
5. Salvează modificările

**Notă:** Dacă IP-ul tău se schimbă (WiFi diferit, VPN, etc.), va trebui să adaugi noul IP.

### 3. Verifică că baza de date este activă

În IONOS Control Panel:
- Verifică că baza de date este **activă** și **running**
- Verifică că nu este suspendată sau pausată

### 4. Verifică credențialele

Asigură-te că:
- Username: `dbu2784141` este corect
- Password: `Mysqldatabase1!` este corect
- Database name: `dbs15142579` este corect
- Host: `db5019335483.hosting-data.io` este corect

### 5. Testează conexiunea manual

Poți testa conexiunea cu `mysql` CLI (dacă ai instalat):

```bash
mysql -h db5019335483.hosting-data.io -P 3306 -u dbu2784141 -p dbs15142579
# Introdu parola: Mysqldatabase1!
```

### 6. Verifică firewall-ul local

Asigură-te că firewall-ul tău permite conexiuni outbound pe portul 3306.

### 7. Alternativă: Folosește conexiune locală pentru testare

Dacă vrei să testezi aplicația local fără să configurezi IONOS acum, poți folosi:

#### Opțiunea A: Docker MySQL
```bash
docker run --name sitemanager-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=sitemanager \
  -p 3306:3306 \
  -d mysql:8.0

# Apoi în .env:
DATABASE_URL="mysql://root:rootpassword@localhost:3306/sitemanager"
```

#### Opțiunea B: Supabase (gratuit, ușor)
1. Mergi la https://supabase.com/
2. Creează cont gratuit
3. Creează proiect
4. Copiază connection string din Settings → Database
5. Actualizează schema Prisma la `provider = "postgresql"` (Supabase folosește PostgreSQL)

### 8. Verifică dacă IONOS permite conexiuni remote

Unele planuri IONOS pot avea restricții pentru conexiuni remote. Verifică în Control Panel dacă:
- Remote access este activat
- Există restricții de IP
- Există limitări pentru planul tău

## Soluție Rapidă Recomandată

Pentru a continua dezvoltarea rapid, recomand:

1. **Pe termen scurt**: Folosește Supabase (gratuit, setup în 5 minute)
2. **Pe termen lung**: Configurează IONOS cu IP whitelist pentru producție

## Verificare Finală

După ce ai configurat IP whitelist în IONOS, testează din nou:

```bash
npm run prisma:migrate
```

Dacă merge, vei vedea:
```
✔ Applied migration `20240106_xxxxx_init` to database
```

