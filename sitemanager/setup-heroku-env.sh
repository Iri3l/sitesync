#!/bin/bash

# Script pentru configurare environment variables pe Heroku
# Rulează: bash setup-heroku-env.sh

APP_NAME="sitesync-app"

echo "⚙️  Configurare environment variables pentru $APP_NAME..."

# Citește valorile din .env
if [ ! -f .env ]; then
    echo "❌ Fișierul .env nu există!"
    exit 1
fi

# Obține URL-ul aplicației
APP_URL=$(heroku info --app $APP_NAME --json 2>/dev/null | grep -o '"web_url":"[^"]*' | cut -d'"' -f4)

if [ -z "$APP_URL" ]; then
    APP_URL="https://$APP_NAME.herokuapp.com"
fi

echo "🌐 URL aplicație: $APP_URL"
echo ""

# Configurează NEXTAUTH_URL
echo "📝 Setează NEXTAUTH_URL..."
heroku config:set NEXTAUTH_URL="$APP_URL" --app $APP_NAME

# Citește și configurează celelalte variabile
echo "📝 Citește variabilele din .env..."

# Funcție pentru a extrage valoarea dintr-un fișier .env
get_env_value() {
    grep "^$1=" .env | cut -d '=' -f2- | sed 's/^["'\'']//' | sed 's/["'\'']$//' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//'
}

NEXTAUTH_SECRET=$(get_env_value "NEXTAUTH_SECRET")
GOOGLE_CLIENT_ID=$(get_env_value "GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET=$(get_env_value "GOOGLE_CLIENT_SECRET")
OPENAI_API_KEY=$(get_env_value "OPENAI_API_KEY")

# Configurează variabilele
if [ ! -z "$NEXTAUTH_SECRET" ]; then
    echo "📝 Setează NEXTAUTH_SECRET..."
    heroku config:set NEXTAUTH_SECRET="$NEXTAUTH_SECRET" --app $APP_NAME
else
    echo "⚠️  NEXTAUTH_SECRET nu este setat în .env - va fi generat unul nou"
    heroku config:set NEXTAUTH_SECRET="$(openssl rand -base64 32)" --app $APP_NAME
fi

if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
    echo "📝 Setează GOOGLE_CLIENT_ID..."
    heroku config:set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" --app $APP_NAME
else
    echo "⚠️  GOOGLE_CLIENT_ID nu este setat în .env"
fi

if [ ! -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "📝 Setează GOOGLE_CLIENT_SECRET..."
    heroku config:set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" --app $APP_NAME
else
    echo "⚠️  GOOGLE_CLIENT_SECRET nu este setat în .env"
fi

if [ ! -z "$OPENAI_API_KEY" ]; then
    echo "📝 Setează OPENAI_API_KEY..."
    heroku config:set OPENAI_API_KEY="$OPENAI_API_KEY" --app $APP_NAME
else
    echo "⚠️  OPENAI_API_KEY nu este setat în .env"
fi

echo ""
echo "✅ Configurare completă!"
echo ""
echo "📋 Variabilele configurate:"
heroku config --app $APP_NAME

echo ""
echo "📝 Următorii pași:"
echo "1. Adaugă PostgreSQL (dacă nu este deja): heroku addons:create heroku-postgresql:mini --app $APP_NAME"
echo "2. Push pe Heroku: git push heroku sitesync:main"
echo "3. Rulează migrații: heroku run npx prisma migrate deploy --app $APP_NAME"

