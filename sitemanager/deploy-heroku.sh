#!/bin/bash

# Script pentru deployment pe Heroku
# Rulează: bash deploy-heroku.sh

APP_NAME="sitesync-app"

echo "🚀 Configurare Heroku pentru $APP_NAME..."

# 1. Verifică dacă ești logat
echo "📋 Verifică autentificare Heroku..."
heroku auth:whoami || {
    echo "❌ Nu ești logat în Heroku. Rulează: heroku login"
    exit 1
}

# 2. Citește variabilele din .env
echo "📖 Citește variabilele din .env..."

if [ ! -f .env ]; then
    echo "❌ Fișierul .env nu există!"
    exit 1
fi

# Extrage valorile din .env
NEXTAUTH_URL=$(grep "^NEXTAUTH_URL=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
NEXTAUTH_SECRET=$(grep "^NEXTAUTH_SECRET=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
GOOGLE_CLIENT_ID=$(grep "^GOOGLE_CLIENT_ID=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
GOOGLE_CLIENT_SECRET=$(grep "^GOOGLE_CLIENT_SECRET=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
OPENAI_API_KEY=$(grep "^OPENAI_API_KEY=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")

# 3. Obține URL-ul aplicației
APP_URL=$(heroku info --app $APP_NAME --json | grep -o '"web_url":"[^"]*' | cut -d'"' -f4)

if [ -z "$APP_URL" ]; then
    APP_URL="https://$APP_NAME.herokuapp.com"
fi

echo "🌐 URL aplicație: $APP_URL"

# 4. Configurează environment variables
echo "⚙️  Configurează environment variables..."

# Actualizează NEXTAUTH_URL cu URL-ul Heroku
heroku config:set NEXTAUTH_URL="$APP_URL" --app $APP_NAME

if [ ! -z "$NEXTAUTH_SECRET" ]; then
    heroku config:set NEXTAUTH_SECRET="$NEXTAUTH_SECRET" --app $APP_NAME
else
    echo "⚠️  NEXTAUTH_SECRET nu este setat în .env"
fi

if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
    heroku config:set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" --app $APP_NAME
fi

if [ ! -z "$GOOGLE_CLIENT_SECRET" ]; then
    heroku config:set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" --app $APP_NAME
fi

if [ ! -z "$OPENAI_API_KEY" ]; then
    heroku config:set OPENAI_API_KEY="$OPENAI_API_KEY" --app $APP_NAME
fi

# DATABASE_URL este setat automat de Heroku PostgreSQL addon
echo "✅ DATABASE_URL va fi setat automat de Heroku PostgreSQL"

# 5. Afișează configurația
echo ""
echo "📋 Configurație actuală:"
heroku config --app $APP_NAME

echo ""
echo "✅ Configurare completă!"
echo ""
echo "📝 Următorii pași:"
echo "1. git push heroku main (sau sitesync dacă ești pe branch-ul sitesync)"
echo "2. heroku run npx prisma migrate deploy --app $APP_NAME"
echo "3. Deschide aplicația: $APP_URL"

