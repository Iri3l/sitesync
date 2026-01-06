# Deployment pe Heroku - Ghid Complet

## ✅ Fișiere create

Am creat următoarele fișiere pentru deployment pe Heroku:

1. **Procfile** - Specifică procesul web pentru Heroku
2. **package.json** - Actualizat cu `postinstall` script pentru Prisma
3. **next.config.js** - Actualizat cu `output: 'standalone'` pentru Heroku
4. **deploy-heroku.sh** - Script automat pentru configurare

## 📋 Pași pentru Deployment

### 1. Autentificare Heroku

Dacă nu ești logat, rulează:
```bash
heroku login
```

### 2. Verifică aplicația creată

Aplicația `sitesync-app` a fost deja creată. Verifică:
```bash
heroku apps:info --app sitesync-app
```

### 3. Adaugă PostgreSQL (dacă nu este deja adăugat)

```bash
heroku addons:create heroku-postgresql:mini --app sitesync-app
```

**Notă:** Planul `mini` este gratuit pentru testare. Pentru producție, consideră un plan plătit.

### 4. Configurează Environment Variables

Rulează scriptul automat:
```bash
bash deploy-heroku.sh
```

SAU configurează manual:

```bash
# Obține URL-ul aplicației
APP_URL=$(heroku info --app sitesync-app --json | grep -o '"web_url":"[^"]*' | cut -d'"' -f4)

# Configurează variabilele
heroku config:set NEXTAUTH_URL="$APP_URL" --app sitesync-app
heroku config:set NEXTAUTH_SECRET="$(openssl rand -base64 32)" --app sitesync-app
heroku config:set GOOGLE_CLIENT_ID="your-google-client-id" --app sitesync-app
heroku config:set GOOGLE_CLIENT_SECRET="your-google-client-secret" --app sitesync-app
heroku config:set OPENAI_API_KEY="sk-your-openai-key" --app sitesync-app
```

**Important:** 
- `DATABASE_URL` este setat automat de Heroku când adaugi PostgreSQL addon
- Înlocuiește valorile cu cele din `.env` local

### 5. Adaugă Remote Heroku (dacă nu există)

```bash
heroku git:remote -a sitesync-app
```

Sau manual:
```bash
git remote add heroku https://git.heroku.com/sitesync-app.git
```

### 6. Push pe Heroku

Dacă ești pe branch-ul `main`:
```bash
git push heroku main
```

Dacă ești pe branch-ul `sitesync`:
```bash
git push heroku sitesync:main
```

### 7. Rulează Migrații

După push, rulează migrațiile:
```bash
heroku run npx prisma migrate deploy --app sitesync-app
```

### 8. Verifică Logs

```bash
heroku logs --tail --app sitesync-app
```

### 9. Deschide Aplicația

```bash
heroku open --app sitesync-app
```

Sau accesează direct: https://sitesync-app.herokuapp.com

## 🔧 Troubleshooting

### Eroare: "No app specified"
```bash
heroku apps:info --app sitesync-app
```

### Eroare: "401 Unauthorized"
```bash
heroku login
```

### Eroare: "Database connection failed"
- Verifică că PostgreSQL addon este activat: `heroku addons --app sitesync-app`
- Verifică DATABASE_URL: `heroku config:get DATABASE_URL --app sitesync-app`

### Eroare: "Build failed"
- Verifică logs: `heroku logs --tail --app sitesync-app`
- Verifică că toate dependențele sunt în `package.json`
- Verifică că `Procfile` există

### Resetare completă
```bash
heroku apps:destroy sitesync-app
heroku create sitesync-app
# Repetă pașii de mai sus
```

## 📊 Verificare Status

```bash
# Status aplicație
heroku ps --app sitesync-app

# Environment variables
heroku config --app sitesync-app

# Addons
heroku addons --app sitesync-app

# Logs
heroku logs --tail --app sitesync-app
```

## 💰 Costuri

- **Heroku Free Tier**: Nu mai este disponibil (de la 28 noiembrie 2022)
- **Heroku Eco Dyno**: $5/lună per dyno
- **PostgreSQL Mini**: $0/lună (pentru testare, limitat)
- **PostgreSQL Standard**: $50/lună (recomandat pentru producție)

## 🚀 Alternativă: Vercel (Gratuit)

Dacă Heroku este prea scump, consideră Vercel:
- Deployment automat din GitHub
- Plan gratuit generos
- Optimizat pentru Next.js
- Setup: https://vercel.com

## 📝 Notițe

- Aplicația va fi disponibilă la: `https://sitesync-app.herokuapp.com`
- Heroku va seta automat `DATABASE_URL` când adaugi PostgreSQL
- Toate variabilele de mediu trebuie setate manual (nu se copiază din `.env`)
- După fiecare push, aplicația se rebuild-ează automat

