# 🔧 Fix pentru Heroku Deployment

## Problema

Build-ul eșuează cu eroarea:
```
Type error: Cannot find module 'next-auth/react' or its corresponding type declarations.
```

## Cauza

Repository-ul Git este în `/Users/irinellazarovici/` (root), dar aplicația este în `/Users/irinellazarovici/sitemanager/`. Când Heroku face build, vede structura `sitemanager/app/...` și nu găsește corect modulele.

## Soluții

### Soluția 1: Mută aplicația în root (Recomandat)

```bash
# Din root-ul repository-ului
cd /Users/irinellazarovici

# Mută toate fișierele din sitemanager/ în root
# (Păstrează doar fișierele SiteSync, nu celelalte proiecte)
mv sitemanager/* .
mv sitemanager/.* . 2>/dev/null || true
rmdir sitemanager

# Commit
git add .
git commit -m "Move SiteSync app to root for Heroku deployment"
git push heroku sitesync:main
```

### Soluția 2: Configurează Heroku să lucreze din subfolder

Creează un `package.json` în root care să ruleze build-ul din `sitemanager/`:

```json
{
  "name": "sitesync-root",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "postinstall": "cd sitemanager && npm install",
    "build": "cd sitemanager && npm run build",
    "start": "cd sitemanager && npm start"
  }
}
```

Și actualizează `Procfile`:
```
web: npm start
```

### Soluția 3: Creează un repository separat pentru SiteSync

```bash
# Creează un nou repository doar pentru SiteSync
cd /Users/irinellazarovici/sitemanager
git init
git remote add origin https://github.com/Iri3l/sitesync.git
git add .
git commit -m "Initial commit"
git push -u origin sitesync

# Apoi deploy pe Heroku din acest repository
heroku git:remote -a sitesync-app
git push heroku sitesync:main
```

## Recomandare

**Soluția 3** este cea mai curată - un repository separat pentru SiteSync, fără să afecteze alte proiecte din root.

## Pași Rapizi (Soluția 3)

```bash
# 1. Mergi în folderul aplicației
cd /Users/irinellazarovici/sitemanager

# 2. Verifică că ești pe branch-ul corect
git branch

# 3. Push pe GitHub (dacă nu este deja)
git push origin sitesync

# 4. Creează aplicație Heroku nouă (sau folosește cea existentă)
heroku create sitesync-app

# 5. Adaugă remote Heroku
heroku git:remote -a sitesync-app

# 6. Push direct din sitemanager/
git push heroku sitesync:main
```

## Verificare

După push, verifică:
```bash
heroku logs --tail --app sitesync-app
heroku ps --app sitesync-app
```

