# Google Drive API Integration - Complete Setup Guide

## ERROR EXPLANATION
**Error**: `"❌ Upload failed: Google Drive not configured"`

This happens when `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, or `GOOGLE_DRIVE_FOLDER_ID` environment variables are missing or invalid.

**Root Cause Check**:
```javascript
// In api/server.js lines 29-31:
const googleClientEmail = process.env.GOOGLE_CLIENT_EMAIL || "";
const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY ? ... : "";
const googleDriveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "";

// In lines 33-43:
if (googleClientEmail && googlePrivateKey) {  // ← If either is empty, driveClient = null
  // ... initialize
}

// In api/server.js line 121-124:
if (!driveClient || !googleDriveFolderId) {  // ← Error thrown here
  throw new Error("Google Drive not configured");
}
```

---

## COMPLETE SETUP INSTRUCTIONS

### ✅ Task 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a Project** → **NEW PROJECT**
3. Name: `Portfolio-Upload` (or similar)
4. Click **CREATE**
5. Wait 1-2 minutes for creation
6. The new project will auto-select

### ✅ Task 2: Enable Google Drive API

1. In the Cloud Console, search for **"Google Drive API"** (top search bar)
2. Click on **Google Drive API**
3. Click **ENABLE** button
4. Wait for it to activate (shows green checkmark)

### ✅ Task 3: Create Service Account (AUTO-GENERATE CREDENTIALS)

1. Go to **APIs & Services → Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS** → **Service Account**
3. Fill form:
   - **Service account name**: `portfolio-uploader`
   - **Service account ID**: `portfolio-uploader` (auto-fills)
   - **Description**: `Handles file uploads for KBO portfolio`
4. Click **CREATE AND CONTINUE**
5. **Grant roles** to this service account:
   - Search/select: **Editor** (full access) OR **Viewer** (read-only, won't work for uploads)
   - Use **Editor** for now
6. Click **CONTINUE** → **DONE**

### ✅ Task 4: Generate & Download Private Key (JSON)

1. Go back to **APIs & Services → Credentials**
2. Under **Service Accounts**, find: `portfolio-uploader@YOUR-PROJECT-ID.iam.gserviceaccount.com`
3. Click on the email address (opens service account details)
4. Go to **KEYS** tab
5. Click **ADD KEY** → **Create new key**
6. Choose **JSON** format
7. Click **CREATE**
8. A JSON file downloads - **SAVE IT SECURELY** (in your project folder temporarily)

### ✅ Task 5: Extract Credentials from JSON

Open the downloaded JSON file. It looks like:

```json
{
  "type": "service_account",
  "project_id": "portfolio-upload-12345",
  "private_key_id": "abc123xyz",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n",
  "client_email": "portfolio-uploader@portfolio-upload-12345.iam.gserviceaccount.com",
  "client_id": "1234567890",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

**Extract these 3 values**:
1. **`client_email`**: Copy the full email address
2. **`private_key`**: Copy the entire key (keep the \n characters)
3. **`project_id`**: Copy the project ID

### ✅ Task 6: Create Upload Folder in Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Right-click → **New Folder**
3. Name: `Portfolio Uploads` (or similar)
4. Click **Create**
5. Right-click the folder → **Share**
6. Paste the `client_email` from your JSON file
7. Give **Editor** permissions
8. Uncheck "Notify people"
9. Click **Share**
10. Open the folder → Copy the URL from browser:
    ```
    https://drive.google.com/drive/folders/1ABC2DEF3GHI4JKL5MNO6PQR7STU8VWX
    ```
    **The FOLDER_ID is**: `1ABC2DEF3GHI4JKL5MNO6PQR7STU8VWX`

### ✅ Task 7: Add Credentials to .env File

Edit `.env` and add these lines:

```bash
# Google Drive API (Service Account)
GOOGLE_CLIENT_EMAIL=portfolio-uploader@portfolio-upload-12345.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBA...
-----END PRIVATE KEY-----
GOOGLE_PROJECT_ID=portfolio-upload-12345
GOOGLE_DRIVE_FOLDER_ID=1ABC2DEF3GHI4JKL5MNO6PQR7STU8VWX
```

**IMPORTANT**: 
- The private key must be on **multiple lines** (paste as-is from JSON)
- Don't add extra quotes around the key
- Don't escape the `\n` - use actual newlines

### ✅ Task 8: Restart Server & Test

1. Stop the current server (Ctrl+C)
2. Run: `node api/server.js`
3. You should see: `Google Drive API initialized successfully`
4. Go to your app and try uploading a file

---

## VERIFICATION CHECKLIST

- [ ] Google Drive API enabled in Google Cloud Console
- [ ] Service Account created with Editor role
- [ ] JSON private key downloaded and saved securely
- [ ] `.env` file has all 4 variables (EMAIL, KEY, PROJECT_ID, FOLDER_ID)
- [ ] Google Drive folder created and shared with Service Account
- [ ] Server logs show `"Google Drive API initialized successfully"`
- [ ] Test upload works from UI

---

## TROUBLESHOOTING

### Issue: "Google Drive not configured" persists

**Fix**:
1. Check `.env` file has all 4 variables (not empty)
2. Server logs should show: `Google Drive API initialized successfully`
3. If not, check for syntax errors in GOOGLE_PRIVATE_KEY

### Issue: "Permission denied" error

**Fix**:
1. Confirm Service Account has **Editor** role
2. Confirm Google Drive folder is **shared** with the Service Account email
3. Delete & recreate the share if needed

### Issue: "Invalid private key" error

**Fix**:
1. Copy the **entire** private key from JSON (including `-----BEGIN PRIVATE KEY-----`)
2. Keep the newlines as-is (don't escape them)
3. Don't add quotes around the key in `.env`

---

## SECURITY BEST PRACTICES

1. **Never commit .env to Git** - add to `.gitignore`
2. **For Vercel deployment**: Add env vars via Vercel dashboard (Settings → Environment Variables)
3. **Restrict Service Account**: Consider using **Viewer** role instead of **Editor** (but then you need upload permissions differently)
4. **Delete downloaded JSON** after adding to `.env` (keep locally only if needed)
5. **Rotate keys periodically**: Delete old keys and create new ones every 6-12 months
