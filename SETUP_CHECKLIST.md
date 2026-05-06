# Google Drive Upload Setup - Interactive Checklist

Use this checklist as you follow the setup steps.

## 🎯 PHASE 1: Google Cloud Project Setup (5 mins)

- [ ] 1.1 Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] 1.2 Click "Select a Project" → "NEW PROJECT"
- [ ] 1.3 Name it: `Portfolio-Upload`
- [ ] 1.4 Click "CREATE" and wait 1-2 minutes
- [ ] 1.5 New project should auto-select

**Status**: ✅ Project created
```
Project ID: [WRITE IT HERE: ____________________]
```

---

## 🎯 PHASE 2: Enable Google Drive API (2 mins)

- [ ] 2.1 In Cloud Console, search for "Google Drive API"
- [ ] 2.2 Click on "Google Drive API" result
- [ ] 2.3 Click "ENABLE" button
- [ ] 2.4 Wait for green checkmark (2-3 seconds)

**Status**: ✅ Google Drive API enabled

---

## 🎯 PHASE 3: Create Service Account (3 mins)

- [ ] 3.1 Go to "APIs & Services → Credentials" (left sidebar)
- [ ] 3.2 Click "+ CREATE CREDENTIALS" → "Service Account"
- [ ] 3.3 Fill the form:
  - Service account name: `portfolio-uploader`
  - Description: `Handles file uploads for KBO portfolio`
- [ ] 3.4 Click "CREATE AND CONTINUE"
- [ ] 3.5 Select role: **Editor** (search for it)
- [ ] 3.6 Click "CONTINUE"
- [ ] 3.7 Click "DONE"

**Status**: ✅ Service Account created
```
Service Account Email: [WRITE IT HERE: ____________________]
```

---

## 🎯 PHASE 4: Generate Private Key JSON (2 mins)

- [ ] 4.1 Go back to "Credentials"
- [ ] 4.2 Under "Service Accounts", click the email you created
- [ ] 4.3 Go to "KEYS" tab
- [ ] 4.4 Click "ADD KEY" → "Create new key"
- [ ] 4.5 Select format: **JSON**
- [ ] 4.6 Click "CREATE"
- [ ] 4.7 JSON file downloads automatically

**Status**: ✅ Private key JSON downloaded
```
Saved as: [WRITE IT HERE: ____________________]
```

---

## 🎯 PHASE 5: Extract Credentials from JSON (2 mins)

Open the downloaded JSON file and fill these in:

```
From "client_email" field:
GOOGLE_CLIENT_EMAIL = ____________________________________

From "private_key" field (entire key with BEGIN/END):
GOOGLE_PRIVATE_KEY = [SAVE FOR LATER]

From "project_id" field:
GOOGLE_PROJECT_ID = ____________________________________
```

---

## 🎯 PHASE 6: Create Google Drive Upload Folder (2 mins)

- [ ] 6.1 Go to [Google Drive](https://drive.google.com)
- [ ] 6.2 Right-click empty space → "New Folder"
- [ ] 6.3 Name: `Portfolio Uploads`
- [ ] 6.4 Click "Create"
- [ ] 6.5 Right-click the folder → "Share"
- [ ] 6.6 Paste the `GOOGLE_CLIENT_EMAIL` value
- [ ] 6.7 Select permission: **Editor**
- [ ] 6.8 UNCHECK "Notify people"
- [ ] 6.9 Click "Share"

**Status**: ✅ Folder created and shared with Service Account

---

## 🎯 PHASE 7: Extract Folder ID (1 min)

- [ ] 7.1 Open the "Portfolio Uploads" folder
- [ ] 7.2 Look at the browser URL
- [ ] 7.3 Copy the Folder ID from: `https://drive.google.com/drive/folders/[FOLDER_ID_HERE]`

**Status**: ✅ Folder ID extracted
```
GOOGLE_DRIVE_FOLDER_ID = ____________________________________
```

---

## 🎯 PHASE 8: Update .env File (2 mins)

- [ ] 8.1 Open the `.env` file in your project
- [ ] 8.2 Find these lines (scroll to bottom):
  ```
  GOOGLE_CLIENT_EMAIL=
  GOOGLE_PRIVATE_KEY=
  GOOGLE_PROJECT_ID=
  GOOGLE_DRIVE_FOLDER_ID=
  ```
- [ ] 8.3 Fill in each value you saved above
- [ ] 8.4 For `GOOGLE_PRIVATE_KEY`:
  - [ ] 8.4a Copy the ENTIRE key from JSON (including `-----BEGIN PRIVATE KEY-----`)
  - [ ] 8.4b Paste it on MULTIPLE LINES (not as `\n`)
  - [ ] 8.4c Keep all the newlines as-is
- [ ] 8.5 Save the file

**Status**: ✅ .env file updated

**Example .env format**:
```bash
GOOGLE_CLIENT_EMAIL=portfolio-uploader@my-project-12345.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDT...
[middle of key...]
...6789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnop
-----END PRIVATE KEY-----
GOOGLE_PROJECT_ID=my-project-12345
GOOGLE_DRIVE_FOLDER_ID=1ABC2DEF3GHI4JKL5MNO6PQR7STU8VWX
```

---

## 🎯 PHASE 9: Verify Configuration (1 min)

- [ ] 9.1 Open terminal in your project folder
- [ ] 9.2 Run: `node verify-google-drive-setup.js`
- [ ] 9.3 Look for: ✅ All checks passed!

If you see errors:
- [ ] Check `.env` file again
- [ ] Make sure private key has actual newlines (not escaped `\n`)
- [ ] Make sure all 4 values are filled in

---

## 🎯 PHASE 10: Start Server & Test (2 mins)

- [ ] 10.1 Stop any running server (Ctrl+C)
- [ ] 10.2 Run: `node api/server.js`
- [ ] 10.3 Look for these log messages:
  - [ ] "✅ Google Drive API initialized successfully"
  - [ ] "Email: [your email]"
  - [ ] "Folder ID: [your folder id]"
- [ ] 10.4 Go to your web app (http://localhost:3001)
- [ ] 10.5 Sign in with Google
- [ ] 10.6 Upload a test file
- [ ] 10.7 Check your Google Drive folder - file should appear!

---

## ✅ COMPLETION CHECKLIST

- [ ] All 10 phases completed
- [ ] Server shows "Google Drive API initialized successfully"
- [ ] Test file uploaded successfully
- [ ] File visible in Google Drive folder
- [ ] Error logs look clean (no warnings)

---

## 🆘 Got Stuck?

1. **Check server logs**: `node api/server.js` - look for error messages
2. **Run verification script**: `node verify-google-drive-setup.js`
3. **Read detailed guide**: `GOOGLE_DRIVE_COMPLETE_GUIDE.md`
4. **Common issues**:
   - [ ] Private key has escaped `\n` instead of actual newlines → Fix: paste key as multiple lines
   - [ ] Folder ID is wrong → Fix: copy from current URL when viewing folder
   - [ ] Service Account doesn't have permission → Fix: reshare folder and set to Editor
   - [ ] .env file not found → Fix: run `npm start` from project root

---

## 📞 Final Notes

- **NEVER commit `.env` to Git** - it has sensitive credentials
- **For Vercel deployment**: Add env vars via Vercel dashboard (Settings → Environment Variables)
- **Keep the JSON file secure** - don't share with anyone
- **Rotate keys every 6 months**: Delete old keys and create new ones

---

## 🎉 Success!

Once you see files uploading to Google Drive, you're done! 
The upload system is now fully configured and working.
