# Google Drive File Upload System - Setup Guide

## Overview
This system allows authenticated users to securely upload files to Google Drive via a Service Account. Files are uploaded to a specific folder you designate, and users can view them via Google Drive link.

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (name: "KBO Portfolio" or similar)
3. Wait for the project to be created

---

## Step 2: Enable Google Drive API

1. In the Cloud Console, search for "Google Drive API"
2. Click on it and press **Enable**
3. Wait for it to activate

---

## Step 3: Create a Service Account

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → Service Account**
3. Fill in:
   - Service account name: `portfolio-uploader`
   - Description: `Handles file uploads for portfolio`
   - Click **Create and Continue**
4. Grant the role: `Editor` (or `Contributor` for more limited access)
5. Click **Continue** and then **Done**

---

## Step 4: Generate Private Key

1. In Credentials, find your created Service Account
2. Click on it (the email address)
3. Go to the **Keys** tab
4. Click **Add Key → Create new key**
5. Choose **JSON** format
6. A JSON file will download - **SAVE THIS SECURELY**

---

## Step 5: Extract Credentials

Open the downloaded JSON file. Extract these values:

```json
{
  "type": "service_account",
  "project_id": "YOUR_PROJECT_ID",
  "private_key_id": "YOUR_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "portfolio-uploader@YOUR_PROJECT.iam.gserviceaccount.com",
  "client_id": "YOUR_CLIENT_ID",
  ...
}
```

You need:
- `client_email`
- `private_key` (the full multi-line key)
- `project_id`

---

## Step 6: Create Upload Folder in Google Drive

1. Open [Google Drive](https://drive.google.com)
2. Create a new folder: "Portfolio Uploads" (or similar)
3. Right-click → **Share**
4. Paste the `client_email` from Step 5
5. Give **Editor** permissions
6. Click **Share**
7. Open the folder and copy its URL: `https://drive.google.com/drive/folders/FOLDER_ID`
   - Extract `FOLDER_ID` from the URL

---

## Step 7: Configure Environment Variables

Add to `.env`:

```bash
# Google Drive API (Service Account)
GOOGLE_CLIENT_EMAIL=portfolio-uploader@YOUR_PROJECT.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID=your-project-id-12345
GOOGLE_DRIVE_FOLDER_ID=1ABC2DEF3GHI4JKL5MNO6PQR7STU8VWX
```

**Important**: 
- The `GOOGLE_PRIVATE_KEY` must preserve newlines: `\n` in the string
- Use quotes around the private key
- Never commit `.env` to Git

---

## Step 8: Test Locally

1. Start the server:
   ```bash
   npm start
   ```

2. Open `http://localhost:3000`

3. Sign in with Google

4. In the Dashboard, upload a test file

5. Check the uploaded file in Google Drive folder

---

## Step 9: Deploy to Vercel

1. In Vercel dashboard, go to **Settings → Environment Variables**

2. Add the same variables:
   ```
   GOOGLE_CLIENT_EMAIL = portfolio-uploader@YOUR_PROJECT.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
   GOOGLE_PROJECT_ID = your-project-id
   GOOGLE_DRIVE_FOLDER_ID = FOLDER_ID
   ```

3. **Important**: For `GOOGLE_PRIVATE_KEY`, paste the key without escaping. Vercel will handle the newlines.

4. Redeploy the app:
   ```bash
   git push
   ```

---

## Allowed File Types

- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, Word (.docx), Excel (.xlsx), Text (.txt)
- **Archives**: ZIP

Maximum file size: **50 MB**

---

## File Upload Flow

```
User (Frontend)
    ↓ [File + Form Data]
Backend API (/api/upload)
    ↓ [Validates file type & size]
    ↓ [Checks user authentication]
Google Drive API
    ↓ [Uploads to designated folder]
    ↓ [Returns file ID & link]
Frontend Dashboard
    ↓ [Shows uploaded file]
User
```

---

## Security Features

✅ **Service Account Authentication**: Credentials stored server-side only  
✅ **User Authentication Check**: Only signed-in users can upload  
✅ **File Type Validation**: Only whitelisted MIME types allowed  
✅ **File Size Limit**: Max 50 MB per file  
✅ **No API Keys in Frontend**: All secrets on backend  
✅ **HttpOnly Cookies**: Session tokens cannot be accessed by JavaScript  

---

## Troubleshooting

### Error: "Google Drive not configured"
- Check `.env` has all four variables
- Verify `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` are set
- Restart the server after changing `.env`

### Error: "File type not allowed"
- Check file extension is in the allowed list above
- Upload a different file type to test

### Error: "Unauthorized: Please sign in first"
- Ensure you're logged in with Google
- Check if session cookie is set (browser DevTools → Application → Cookies)

### File uploads to wrong folder
- Verify `GOOGLE_DRIVE_FOLDER_ID` is correct
- Ensure the service account email has Editor permissions on the folder
- Check folder sharing settings

### Private key formatting error
- Make sure newlines in the key are represented as `\n` (literal characters, not actual line breaks)
- Don't add extra spaces or quotes around the key value

---

## Next Steps

1. ✅ Set up the Service Account
2. ✅ Configure environment variables
3. ✅ Test locally with a few file uploads
4. ✅ Deploy to Vercel
5. ✅ Test production uploads
6. 📊 (Optional) Add upload history to database
7. 📊 (Optional) Add file deletion endpoint

---

## API Endpoints

### POST `/api/upload`
Upload a file to Google Drive.

**Request**:
```
Content-Type: multipart/form-data
Cookie: kbo_session=<token>

Body: {
  "file": <binary file data>
}
```

**Response**:
```json
{
  "success": true,
  "file": {
    "fileId": "1ABC2DEF3GHI4JKL5MNO6PQR7STU8VWX",
    "fileName": "user@email.com-1717665432000.pdf",
    "size": 2048576,
    "webViewLink": "https://drive.google.com/file/d/1ABC.../view",
    "createdTime": "2026-05-06T12:30:32.000Z"
  }
}
```

---

## Questions?

Refer to the [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
