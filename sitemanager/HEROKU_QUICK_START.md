# 🚀 Heroku Quick Start - Pași Finali

## ✅ Ce am făcut deja:

1. ✅ Creat `Procfile` pentru Heroku
2. ✅ Actualizat `package.json` cu `postinstall` script
3. ✅ Actualizat `next.config.js` cu `output: 'standalone'`
4. ✅ Creat aplicația Heroku `sitesync-app`
5. ✅ Adăugat remote Heroku în Git
6. ✅ Făcut commit pentru toate modificările

## 📋 Pași Finali (Rulează în Terminal):

### 1. Autentificare Heroku

```bash
heroku login
```

### 2. Verifică aplicația

```bash
heroku apps:info --app sitesync-app
```

Dacă aplicația nu există, creeaz-o:
```bash
heroku create sitesync-app
```

### 3. Adaugă PostgreSQL

```bash
heroku addons:create heroku-postgresql:mini --app sitesync-app
```

**Notă:** Dacă primești eroare că planul nu este disponibil, încearcă:
```bash
heroku addons:create heroku-postgresql:essential-0 --app sitesync-app
```

### 4. Configurează Environment Variables

Rulează scriptul automat:
```bash
bash setup-heroku-env.sh
```

SAU configurează manual (înlocuiește valorile cu cele din `.env`):

```bash
# Obține URL-ul aplicației
APP_URL="https://sitesync-app.herokuapp.com"

# Configurează variabilele
heroku config:set NEXTAUTH_URL="$APP_URL" --app sitesync-app
heroku config:set NEXTAUTH_SECRET="$(openssl rand -base64 32)" --app sitesync-app
heroku config:set GOOGLE_CLIENT_ID="your-google-client-id" --app sitesync-app
heroku config:set GOOGLE_CLIENT_SECRET="your-google-client-secret" --app sitesync-app
heroku config:set OPENAI_API_KEY="sk-your-openai-key" --app sitesync-app
```

**Important:** 
- `DATABASE_URL` este setat automat de Heroku când adaugi PostgreSQL
- Copiază valorile din `.env` local pentru `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENAI_API_KEY`

### 5. Push pe Heroku

Ești pe branch-ul `sitesync`, deci:

```bash
git push heroku sitesync:main
```

Sau dacă vrei să push-ezi `main`:
```bash
git checkout main
git merge sitesync
git push heroku main
```

### 6. Rulează Migrații

După push, rulează migrațiile pentru a crea tabelele în baza de date:

```bash
heroku run npx prisma migrate deploy --app sitesync-app
```

### 7. Verifică Logs

```bash
heroku logs --tail --app sitesync-app
```

### 8. Deschide Aplicația

```bash
heroku open --app sitesync-app
```

Sau accesează direct: **https://sitesync-app.herokuapp.com**

## 🔍 Verificare Rapidă

```bash
# Status aplicație
heroku ps --app sitesync-app

# Environment variables
heroku config --app sitesync-app

# Addons (verifică PostgreSQL)
heroku addons --app sitesync-app

# Logs în timp real
heroku logs --tail --app sitesync-app
```

## ⚠️ Probleme Comune

### "Couldn't find that app"
- Verifică că ești logat: `heroku login`
- Verifică numele aplicației: `heroku apps`

### "401 Unauthorized"
- Reautentifică-te: `heroku login`
- Verifică că ai acces la aplicație: `heroku apps:info --app sitesync-app`

### "Database connection failed"
- Verifică că PostgreSQL este activat: `heroku addons --app sitesync-app`
- Verifică DATABASE_URL: `heroku config:get DATABASE_URL --app sitesync-app`

### "Build failed"
- Verifică logs: `heroku logs --tail --app sitesync-app`
- Verifică că toate fișierele sunt commit-uite
- Verifică că `Procfile` există

## 📝 Comenzi Complete (Copy-Paste)

```bash
# 1. Login
heroku login

# 2. Verifică aplicația
heroku apps:info --app sitesync-app

# 3. Adaugă PostgreSQL
heroku addons:create heroku-postgresql:mini --app sitesync-app

# 4. Configurează environment variables (înlocuiește valorile!)
heroku config:set NEXTAUTH_URL="https://sitesync-app.herokuapp.com" --app sitesync-app
heroku config:set NEXTAUTH_SECRET="$(openssl rand -base64 32)" --app sitesync-app
# Adaugă celelalte variabile din .env

# 5. Push
git push heroku sitesync:main

# 6. Migrații
heroku run npx prisma migrate deploy --app sitesync-app

# 7. Deschide
heroku open --app sitesync-app
```

## 🎉 Gata!

După ce rulezi toate comenzile, aplicația ar trebui să fie live pe Heroku!

