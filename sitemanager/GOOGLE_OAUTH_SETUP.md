# Setup Google OAuth pentru Site Manager

## Eroarea: "Error 401: invalid_client"

Această eroare apare când Google OAuth nu este configurat corect sau credențialele lipsesc.

## Soluție Rapidă: Folosește Magic Link (Email)

Pentru moment, poți folosi **Magic Link** (autentificare prin email) care nu necesită configurare Google:

1. Pe pagina de sign-in, introdu email-ul tău
2. Click pe "Send Magic Link"
3. Verifică email-ul pentru link-ul de autentificare

**Notă:** Pentru ca Magic Link să funcționeze, trebuie să configurezi un serviciu de email în `.env` (vezi mai jos).

## Setup Google OAuth (Opțional)

Dacă vrei să folosești Google sign-in, urmează acești pași:

### Pasul 1: Creează OAuth Credentials în Google Cloud Console

1. Mergi la https://console.cloud.google.com/
2. Creează un proiect nou sau selectează unul existent
3. Activează **Google+ API**:
   - Mergi la **APIs & Services** → **Library**
   - Caută "Google+ API" sau "Google Identity"
   - Click pe **Enable**

### Pasul 2: Creează OAuth 2.0 Credentials

1. Mergi la **APIs & Services** → **Credentials**
2. Click pe **Create Credentials** → **OAuth client ID**
3. Dacă e prima dată, va trebui să configurezi **OAuth consent screen**:
   - **User Type**: External (pentru testare) sau Internal (pentru organizații)
   - **App name**: Site Manager
   - **User support email**: Email-ul tău
   - **Developer contact**: Email-ul tău
   - Click **Save and Continue**
   - Scopes: Lasă default, click **Save and Continue**
   - Test users: Adaugă email-ul tău, click **Save and Continue**
   - Review: Click **Back to Dashboard**

4. Acum creează OAuth Client ID:
   - **Application type**: Web application
   - **Name**: Site Manager Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
   - Click **Create**

5. **Copiază Client ID și Client Secret** (le vei folosi în `.env`)

### Pasul 3: Actualizează .env

Deschide `.env` și actualizează:

```env
GOOGLE_CLIENT_ID="your-actual-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-actual-client-secret-here"
```

**Important:** 
- Nu folosi valori placeholder
- Nu pune ghilimele în jurul valorilor
- Client ID și Client Secret trebuie să fie reale din Google Cloud Console

### Pasul 4: Restart Server

După ce ai actualizat `.env`:

```bash
# Oprește serverul (Ctrl+C)
# Apoi pornește din nou:
npm run dev
```

## Setup Email pentru Magic Link (Alternativă)

Dacă nu vrei să configurezi Google OAuth, poți folosi Magic Link. Pentru asta, trebuie să configurezi un serviciu de email:

### Opțiunea 1: Gmail (Simplu pentru testare)

1. Activează **App Password** în contul tău Google:
   - Mergi la https://myaccount.google.com/apppasswords
   - Generează o parolă pentru "Mail"
   - Copiază parola generată

2. Actualizează `.env`:
```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="app-password-generated-above"
EMAIL_FROM="your-email@gmail.com"
```

### Opțiunea 2: Resend (Recomandat pentru producție)

1. Mergi la https://resend.com/
2. Creează cont gratuit
3. Obține API key
4. Actualizează `.env` cu setările Resend

## Verificare

După configurare:

1. **Pentru Google OAuth:**
   - Click pe "Continue with Google"
   - Ar trebui să te redirecționeze la Google pentru autentificare

2. **Pentru Magic Link:**
   - Introdu email-ul
   - Click "Send Magic Link"
   - Verifică inbox-ul pentru link

## Troubleshooting

### "invalid_client" error
- Verifică că `GOOGLE_CLIENT_ID` și `GOOGLE_CLIENT_SECRET` sunt corecte în `.env`
- Verifică că redirect URI este exact: `http://localhost:3000/api/auth/callback/google`
- Verifică că OAuth consent screen este configurat

### Magic Link nu funcționează
- Verifică că email server este configurat corect în `.env`
- Pentru Gmail, folosește App Password, nu parola normală
- Verifică spam folder-ul

## Recomandare

Pentru dezvoltare rapidă:
1. **Folosește Magic Link** cu Gmail App Password (cel mai simplu)
2. **Configurează Google OAuth** mai târziu pentru producție



