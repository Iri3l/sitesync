# OpenAI API Setup for Delivery Note Processing

The AI-powered delivery note processing feature requires an OpenAI API key to work.

## How to Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the API key (you'll only see it once!)

## How to Configure the API Key

### Local Development

1. Open the `.env` file in the project root
2. Add the following line:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Replace `sk-your-api-key-here` with your actual API key
4. Save the file
5. Restart your development server (`npm run dev`)

### Production (IONOS)

1. Go to your IONOS Deploy Now project settings
2. Navigate to "Environment Variables" or "Secrets"
3. Add a new environment variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-`)
4. Save and redeploy your application

## Testing

After configuring the API key:

1. Log in as a **manager**
2. Go to **Stock** → **Upload Delivery Note**
3. Select a site
4. Upload a photo of a delivery note
5. Click "Process Delivery Note"
6. The AI should extract items from the delivery note

## Troubleshooting

### Error: "OpenAI API key is not configured"
- Make sure `OPENAI_API_KEY` is set in your `.env` file (local) or environment variables (production)
- Restart your server after adding the key

### Error: "OpenAI API key is invalid"
- Verify your API key is correct
- Check if your OpenAI account has available credits
- Make sure the key starts with `sk-`

### Error: "Rate limit exceeded"
- You've exceeded your OpenAI API usage limit
- Wait a few minutes and try again
- Consider upgrading your OpenAI plan if this happens frequently

## Cost Information

- The feature uses GPT-4o-mini model
- Cost: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Processing a delivery note typically costs less than $0.01 per image
- Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## Security Notes

- **Never commit your API key to Git**
- The `.env` file is already in `.gitignore`
- Keep your API key secret and don't share it publicly

