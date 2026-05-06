# Google Drive Upload - Troubleshooting Guide

Use this guide when you encounter errors during setup or usage.

---

## ❌ Error: "Google Drive not configured"

### What it means:
One or more required environment variables are missing or empty.

### How to fix:

1. **Check your `.env` file**:
   ```bash
   cat .env | grep GOOGLE_
   ```
   You should see all 4 lines:
   ```
   GOOGLE_CLIENT_EMAIL=...
   GOOGLE_PRIVATE_KEY=...
   GOOGLE_PROJECT_ID=...
   GOOGLE_DRIVE_FOLDER_ID=...
   ```

2. **Run the verification script**:
   ```bash
   node verify-google-drive-setup.js
   ```
   It will tell you exactly which variables are missing.

3. **Follow setup guide**:
   - Read: `GOOGLE_DRIVE_QUICK_START.md`
   - Or use: `SETUP_CHECKLIST.md`

4. **Restart server**:
   ```bash
   node api/server.js
   ```
   Should see: `✅ Google Drive API initialized successfully`

---

## ❌ Error: "Invalid private key"

### What it means:
The private key format is wrong - likely has escaped newlines instead of actual newlines.

### How to fix:

**WRONG** ❌:
```bash
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

**CORRECT** ✅:
```bash
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBA...
[middle lines of key]
...abc123
-----END PRIVATE KEY-----
```

### Steps:
1. Open `.env` file in your editor
2. Find the `GOOGLE_PRIVATE_KEY` line
3. Delete it completely
4. Reopen your downloaded JSON file
5. Copy the entire `private_key` value (including BEGIN/END lines)
6. Paste into `.env` on MULTIPLE LINES
7. Don't add quotes around it
8. Save and restart server

---

## ❌ Error: "Permission denied" when uploading

### What it means:
The Service Account email doesn't have permission to write to the Google Drive folder.

### How to fix:

1. **Check folder sharing**:
   - Go to [Google Drive](https://drive.google.com)
   - Find your "Portfolio Uploads" folder
   - Right-click → **Share**
   - Look for: `portfolio-uploader@YOUR-PROJECT.iam.gserviceaccount.com`

2. **If NOT shared**:
   - Right-click folder → **Share**
   - Paste Service Account email
   - Select permission: **Editor** (not Viewer!)
   - Click **Share**

3. **If permission is wrong**:
   - Right-click folder → **Share**
   - Find the Service Account entry
   - Click the permission dropdown
   - Change to: **Editor**
   - Click **Update**

4. **If still doesn't work**:
   - Remove the share completely
   - Wait 30 seconds
   - Re-share with Editor permission

### Verify:
After fixing, test with a small file (< 1MB)

---

## ❌ Error: "Folder not found"

### What it means:
The `GOOGLE_DRIVE_FOLDER_ID` doesn't exist or is invalid.

### How to fix:

1. **Go to Google Drive**:
   ```
   https://drive.google.com
   ```

2. **Find your folder**:
   - Look for "Portfolio Uploads" folder
   - If doesn't exist: Create it (New → Folder)

3. **Get the Folder ID**:
   - Open the folder
   - Look at the URL in address bar:
     ```
     https://drive.google.com/drive/folders/1ABC2DEF3GHI4JKL5MNO
     ```
   - Copy the ID part: `1ABC2DEF3GHI4JKL5MNO`

4. **Update `.env`**:
   ```bash
   GOOGLE_DRIVE_FOLDER_ID=1ABC2DEF3GHI4JKL5MNO
   ```

5. **Verify format**:
   - Should be ~30+ characters
   - Should have letters, numbers, underscores
   - Should NOT include `/` or `?`

6. **Restart server**:
   ```bash
   node api/server.js
   ```

---

## ❌ Error: "Failed to authenticate with JWT"

### What it means:
The Service Account email or private key is invalid.

### How to fix:

1. **Verify Service Account exists**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Go to **APIs & Services → Credentials**
   - Under "Service Accounts", find `portfolio-uploader`
   - Click on it to open details

2. **Check email format**:
   - Should look like: `portfolio-uploader@YOUR-PROJECT.iam.gserviceaccount.com`
   - Compare with what's in `.env`
   - Must match exactly (including `@YOUR-PROJECT.iam.gserviceaccount.com` part)

3. **Check private key**:
   - Go to **KEYS** tab
   - You should see one key listed
   - If no keys: click **ADD KEY** → **Create new key**
   - Format: **JSON**
   - Download the JSON file
   - Re-extract and paste private key into `.env`

4. **Restart server**:
   ```bash
   node api/server.js
   ```

---

## ❌ Error: "The 'X-Goog-Upload-Protocol' header is required"

### What it means:
This is usually a Google API version compatibility issue. (Rare - not your fault)

### How to fix:

Update the googleapis package:
```bash
npm install googleapis@latest
```

Then restart server:
```bash
node api/server.js
```

---

## ❌ Error: "File size exceeds limit"

### What it means:
The file you're trying to upload is larger than 50MB.

### How to fix:

1. **Choose a smaller file**
   - 50MB limit is set in `api/server.js` line 47
   - You can increase it if needed (not recommended)

2. **Compress the file**:
   - Use ZIP for documents
   - Use JPEG for images instead of PNG
   - Use PDF instead of DOCX for large documents

3. **Split large files**:
   - Upload in multiple files
   - Rename them: `part1`, `part2`, etc.

---

## ❌ Error: "Unauthorized: Please sign in first"

### What it means:
You must be logged in with Google to upload files.

### How to fix:

1. **Go to your app**: `http://localhost:3001`
2. **Click "Sign in with Google"**
3. **Complete Google login**
4. **Wait for page to load fully**
5. **Then try uploading file**

---

## ⚠️ Warning: ".env file not found"

### What it means:
The `.env` file doesn't exist in your project root.

### How to fix:

1. **Create `.env` file**:
   ```bash
   touch .env
   ```

2. **Copy from `.env.example`**:
   ```bash
   cp .env.example .env
   ```

3. **Edit the new `.env` file**:
   - Add all 4 Google Drive variables
   - Keep other variables from `.env.example`

4. **Make sure `.env` is in `.gitignore`**:
   ```
   # In .gitignore file:
   .env
   .env.local
   ```

---

## ⚠️ Warning: "Google Drive API not configured" on server start

### What it means:
Your `.env` file has empty values or missing variables. Server will still start but uploads will fail.

### How to fix:

Check this message in your terminal:
```
⚠️ Google Drive API not configured
   Missing: GOOGLE_CLIENT_EMAIL GOOGLE_PRIVATE_KEY
```

It tells you exactly which variables are missing.

Fill them in your `.env` file and restart.

---

## ✅ How to verify your setup works

### Step 1: Run verification script
```bash
node verify-google-drive-setup.js
```

Expected output:
```
✅ GOOGLE_CLIENT_EMAIL - SET
✅ GOOGLE_PRIVATE_KEY - SET
✅ GOOGLE_PROJECT_ID - SET
✅ GOOGLE_DRIVE_FOLDER_ID - SET
✅ All checks passed!
```

### Step 2: Start server
```bash
node api/server.js
```

Expected output:
```
✅ Google Drive API initialized successfully
   Email: portfolio-uploader@your-project.iam.gserviceaccount.com
   Folder ID: 1ABC2DEF3GHI4JKL5MNO
```

### Step 3: Test upload
1. Go to `http://localhost:3001`
2. Sign in with Google
3. Upload a test file
4. Watch terminal - should see: `📤 Uploading file...` then `✅ File uploaded successfully`
5. Check your Google Drive folder - file should appear!

---

## 🔍 Debug Mode - Enable Verbose Logging

To see more details when debugging, add this to the top of `api/server.js`:

```javascript
// Add after require statements:
process.env.DEBUG = '*'; // Enable debug logging

// Or just for Google Drive:
process.env.DEBUG = 'googleapis:*';
```

Then run server:
```bash
DEBUG=* node api/server.js
```

This will show lots of details about API calls.

---

## 📋 Checklist for Debugging

When something doesn't work, check this in order:

- [ ] Server starts without errors?
  ```bash
  node api/server.js
  ```

- [ ] Sees "✅ Google Drive API initialized successfully"?
  - If NO: Check `.env` file

- [ ] Run `node verify-google-drive-setup.js`?
  - If fails: Follow error messages

- [ ] User is logged in?
  - Check if "Sign in" button changed to "Dashboard"

- [ ] File selected (< 50MB)?
  - Try a small text file first

- [ ] Browser console shows errors?
  - F12 → Console → Look for red errors
  - Check Network tab → POST to /api/upload

- [ ] Server logs show error?
  - Watch terminal while uploading
  - Copy exact error message

- [ ] Service Account email shared on folder?
  - Go to Drive → Right-click folder → Share

- [ ] Service Account has Editor (not Viewer)?
  - Check permission level

---

## 🆘 Still Stuck?

1. **Copy the exact error message** you see
2. **Check if it's in this troubleshooting guide**
3. **Read the detailed guide**: `GOOGLE_DRIVE_COMPLETE_GUIDE.md`
4. **Run verification script**: `node verify-google-drive-setup.js`
5. **Check server logs**: `node api/server.js` (watch terminal)
6. **Check browser console**: F12 → Console tab
7. **Check Network tab**: F12 → Network → Click POST /api/upload

Most issues are one of these:
- ❌ Missing `.env` variable
- ❌ Wrong private key format (escaped newlines)
- ❌ Service Account not shared on folder
- ❌ Service Account doesn't have Editor permission
- ❌ Folder ID is incorrect

Fix any of these and uploads should work!
