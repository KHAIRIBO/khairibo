# Khairi Bouzakher Portfolio

A minimalist, high-end portfolio built with Node.js, Express, and React (via esm.sh).

## Deployment

This project is optimized for **Vercel**. 

1. Connect this repository to Vercel.
2. Set the following Environment Variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `SESSION_SECRET`
   - `ALLOWED_ORIGINS` (recommended: `https://khairibouzakher.vercel.app`)
3. Vercel will automatically deploy the app using the `vercel.json` configuration.

## Local Development

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Open `http://localhost:3000`

## Host Configuration (Local + Production)

The API now accepts requests from both local and production origins.

- Local default: `http://localhost:3000`
- Production default: `https://khairibouzakher.vercel.app`

You can override both using `ALLOWED_ORIGINS` as a comma-separated list.

## Google Login Setup

Add the same credentials to local `.env` and Vercel environment variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`

For Google OAuth, add these JavaScript origins:

- `http://localhost:3000`
- `https://khairibouzakher.vercel.app`

## Google Drive File Upload Setup

To enable secure file uploads to Google Drive:

1. Create a Service Account in Google Cloud Console
2. Generate a private key (JSON format)
3. Extract and add to `.env`:
   - `GOOGLE_CLIENT_EMAIL` (from service account)
   - `GOOGLE_PRIVATE_KEY` (from private key JSON)
   - `GOOGLE_PROJECT_ID` (from service account)
4. Create a folder in Google Drive and share it with the service account email
5. Add the folder ID to `GOOGLE_DRIVE_FOLDER_ID`

**Security**: Never commit `.env` to version control. Use environment variables in Vercel.
