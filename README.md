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

⚠️ **If you see error "❌ Upload failed: Google Drive not configured"**, follow these guides in order:

1. **Quick Start (5 minutes)**: [GOOGLE_DRIVE_QUICK_START.md](./GOOGLE_DRIVE_QUICK_START.md)
2. **Interactive Checklist**: [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)  
3. **Detailed Guide with Troubleshooting**: [GOOGLE_DRIVE_COMPLETE_GUIDE.md](./GOOGLE_DRIVE_COMPLETE_GUIDE.md)
4. **Verify Setup**: Run `node verify-google-drive-setup.js`

### What You Need

To enable secure file uploads to Google Drive, you need:

1. **Google Cloud Project** (free tier)
2. **Service Account** with Google Drive API enabled
3. **Private Key (JSON)** - downloaded from Google Cloud Console
4. **Google Drive Folder** - created and shared with Service Account
5. **Environment Variables** in `.env`:
   ```bash
   GOOGLE_CLIENT_EMAIL=portfolio-uploader@YOUR-PROJECT.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
   ...your full private key...
   -----END PRIVATE KEY-----
   GOOGLE_PROJECT_ID=YOUR-PROJECT-ID
   GOOGLE_DRIVE_FOLDER_ID=YOUR-FOLDER-ID
   ```

### Setup Steps (Summary)

1. Create Google Cloud Project
2. Enable Google Drive API
3. Create Service Account (portfolio-uploader)
4. Generate and download Private Key (JSON format)
5. Create folder in Google Drive and share with Service Account email
6. Add credentials to `.env` file
7. Run `node verify-google-drive-setup.js` to verify
8. Restart server: `node api/server.js`

⚠️ **Important**: 
- Private key must have actual newlines (not escaped `\n`)
- Never commit `.env` to Git
- For Vercel: add env vars via dashboard (not in .env)

**Security**: Never commit `.env` to version control. Use environment variables in Vercel.

