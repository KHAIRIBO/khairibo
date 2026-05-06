# QUICK START - Google Drive Setup (5 Minutes)

## ⚡ TL;DR - Just Do This

### Step 1: Go to Google Cloud Console
```
https://console.cloud.google.com
```

### Step 2: Create Project
- Click **Select a Project** → **NEW PROJECT**
- Name: `Portfolio-Upload`
- Click **CREATE**

### Step 3: Enable Google Drive API
- Search for: **"Google Drive API"**
- Click **ENABLE**

### Step 4: Create Service Account
- Go to **APIs & Services → Credentials**
- Click **+ CREATE CREDENTIALS** → **Service Account**
- Name: `portfolio-uploader`
- Click **CREATE AND CONTINUE**
- Role: **Editor**
- Click **CONTINUE** → **DONE**

### Step 5: Generate Private Key
- In **Service Accounts**, click on `portfolio-uploader@...`
- Go to **KEYS** tab
- Click **ADD KEY** → **Create new key**
- Format: **JSON**
- Click **CREATE** (downloads JSON file)

### Step 6: Extract 3 Values from JSON File
```json
{
  "client_email": "portfolio-uploader@YOUR-PROJECT.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "project_id": "YOUR-PROJECT-ID"
}
```

### Step 7: Create Google Drive Folder
- Open [Google Drive](https://drive.google.com)
- Right-click → **New Folder**
- Name: `Portfolio Uploads`
- Right-click → **Share**
- Paste: `portfolio-uploader@YOUR-PROJECT.iam.gserviceaccount.com`
- Permission: **Editor**
- Click **Share**

### Step 8: Get Folder ID
- Open the folder
- Copy URL: `https://drive.google.com/drive/folders/ABC123DEF456`
- **Folder ID**: `ABC123DEF456`

### Step 9: Update .env File
Edit `.env` and add:
```bash
GOOGLE_CLIENT_EMAIL=portfolio-uploader@YOUR-PROJECT.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
[paste full key here - keep newlines]
-----END PRIVATE KEY-----
GOOGLE_PROJECT_ID=YOUR-PROJECT-ID
GOOGLE_DRIVE_FOLDER_ID=ABC123DEF456
```

**IMPORTANT**: Private key should be on MULTIPLE LINES (not escaped)

### Step 10: Verify & Restart
```bash
node verify-google-drive-setup.js
```

Should see: ✅ All checks passed!

### Step 11: Start Server
```bash
node api/server.js
```

Should see: ✅ Google Drive API initialized successfully

### Step 12: Test Upload
1. Go to your web app
2. Sign in with Google
3. Upload a file
4. Should appear in your Google Drive folder

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "Google Drive not configured" | Check .env file has all 4 variables filled |
| "Invalid private key" | Paste key with actual newlines (not `\n`) |
| "Permission denied" | Service Account needs Editor role on Drive folder |
| "Folder not found" | Check GOOGLE_DRIVE_FOLDER_ID is correct |

---

## 📝 More Help

- Full guide: `GOOGLE_DRIVE_COMPLETE_GUIDE.md`
- Verification: `node verify-google-drive-setup.js`
- Server logs: Watch terminal for errors when uploading
