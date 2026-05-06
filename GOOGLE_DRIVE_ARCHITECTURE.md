# Google Drive Upload Architecture & Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          YOUR WEB APP                           │
│                                                                 │
│  Frontend (React):                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ User clicks "Upload File"                               │   │
│  │ → File selected → FormData created → POST /api/upload   │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ File buffer sent
                         │ (multipart/form-data)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       YOUR NODE.JS SERVER                       │
│                                                                 │
│  Backend (Express):                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ POST /api/upload handler:                               │   │
│  │ 1. Check user authentication (session cookie)           │   │
│  │ 2. Validate file (size, type)                           │   │
│  │ 3. Generate unique filename                             │   │
│  │ 4. Call uploadFileToGoogleDrive() ─────────┐            │   │
│  └─────────────────────────────────────────────┼────────────┘   │
│                                                 │                │
│  uploadFileToGoogleDrive():                    │                │
│  ┌─────────────────────────────────────────────┼────────────┐   │
│  │ 1. Check if driveClient initialized        │            │   │
│  │    - Requires: GOOGLE_CLIENT_EMAIL ◄────────┼────────────┤   │
│  │    - Requires: GOOGLE_PRIVATE_KEY ◄────────┼────────────┤   │
│  │ 2. Check if folder ID exists               │            │   │
│  │    - Requires: GOOGLE_DRIVE_FOLDER_ID ◄───┼────────────┤   │
│  │ 3. Create file in Google Drive            │            │   │
│  │ 4. Return file metadata (ID, link)        │            │   │
│  │ 5. Send response back to frontend         │            │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Uses JWT authentication
                         │ with Service Account
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GOOGLE DRIVE API                            │
│                  (cloud.google.com)                             │
│                                                                 │
│  Service Account credentials:                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Email: portfolio-uploader@my-project.iam...             │   │
│  │ Private Key: (used to sign JWT tokens)                  │   │
│  │ → Authenticates upload request                          │   │
│  │ → Creates file in designated folder                     │   │
│  │ → Returns file metadata                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                       │
│  Your Google Drive:    │                                       │
│  ┌─────────────────────┼───────────────────────────────────┐   │
│  │ Folder: Portfolio Uploads                               │   │
│  │ ├── user1@...@20240506001_photo.jpg                    │   │
│  │ ├── user2@...@20240506002_document.pdf                 │   │
│  │ └── user3@...@20240506003_resume.docx                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Upload Flow Sequence

```
User                   Frontend              Backend               Google Drive
│                        │                      │                      │
│─ Click Upload ───────→│                      │                      │
│                        │                      │                      │
│                        │─ Select File ─────→ (browser dialog)        │
│                        │                      │                      │
│                        │ ← File Selected ─────│                      │
│                        │                      │                      │
│                        │─ POST /api/upload ──→│                      │
│                        │  (multipart FormData)│                      │
│                        │                      │                      │
│                        │                      │─ Validate:            │
│                        │                      │  • Check auth         │
│                        │                      │  • Check file size    │
│                        │                      │  • Generate filename  │
│                        │                      │                      │
│                        │                      │─ Call Google Drive ──→│
│                        │                      │  API (JWT token)      │
│                        │                      │                      │
│                        │                      │                    ✅ Create file
│                        │                      │                    ✅ Get link
│                        │                      │                    ✅ Get metadata
│                        │                      │                      │
│                        │                      │← File metadata ──────│
│                        │                      │  (ID, link, size)    │
│                        │                      │                      │
│                        │← Response (JSON) ────│                      │
│                        │  {file, message}     │                      │
│                        │                      │                      │
│← Success Message ──────│                      │                      │
│  ✅ File uploaded!     │                      │                      │
│  📎 View on Drive      │                      │                      │
```

---

## 🔐 Authentication Method: Service Account (JWT)

```
┌─────────────────────────────────────────┐
│        Your Server (.env)               │
│                                         │
│ GOOGLE_CLIENT_EMAIL:                    │
│ portfolio-uploader@project.iam...       │
│                                         │
│ GOOGLE_PRIVATE_KEY:                     │
│ -----BEGIN PRIVATE KEY-----             │
│ ...base64 encoded key...                │
│ -----END PRIVATE KEY-----               │
└────────┬────────────────────────────────┘
         │
         │ 1. Server needs to authenticate
         │    to Google Drive API
         │
         ▼
┌─────────────────────────────────────────┐
│    JWT Token Creation (google-auth)     │
│                                         │
│ 1. Create JWT header                    │
│ 2. Create JWT payload:                  │
│    {                                    │
│      iss: client_email,                 │
│      scope: drive scope,                │
│      aud: token endpoint,               │
│      iat: current_time,                 │
│      exp: current_time + 3600           │
│    }                                    │
│ 3. Sign with private key (HMAC-SHA256)  │
│ 4. Send JWT to Google OAuth endpoint    │
└────────┬────────────────────────────────┘
         │
         │ 2. Exchange JWT for Access Token
         │
         ▼
┌─────────────────────────────────────────┐
│    Google OAuth Server                  │
│    (googleapis.com)                     │
│                                         │
│ • Validates JWT signature               │
│ • Checks if service account exists      │
│ • Generates access_token (1 hour)       │
│ • Sends back to server                  │
└────────┬────────────────────────────────┘
         │
         │ 3. Use Access Token for API calls
         │
         ▼
┌─────────────────────────────────────────┐
│    Google Drive API                     │
│                                         │
│ Authorization header:                   │
│ Bearer {access_token}                   │
│                                         │
│ Permissions check:                      │
│ ✓ Service Account has access            │
│ ✓ File will be created in folder        │
│ ✓ File metadata returned                │
└─────────────────────────────────────────┘
```

---

## 🛠️ Environment Variables Dependency

```
Server Initialization:
│
├─ Load .env file (dotenv)
│
├─ Read GOOGLE_CLIENT_EMAIL
│  └─ If missing: ❌ Skip initialization, show warning
│
├─ Read GOOGLE_PRIVATE_KEY
│  └─ If missing: ❌ Skip initialization, show warning
│
├─ Initialize JWT client with both
│  └─ If error: ❌ Log error, driveClient = null
│
├─ Create google.drive() instance
│  └─ If success: ✅ driveClient is ready
│
└─ Read GOOGLE_DRIVE_FOLDER_ID
   └─ If missing: ⚠️ Warning (will fail during upload)


Upload Attempt:
│
├─ Check: Is driveClient initialized?
│  └─ If NO: ❌ Throw "Google Drive not configured"
│
├─ Check: Is GOOGLE_DRIVE_FOLDER_ID set?
│  └─ If NO: ❌ Throw "Google Drive not configured"
│
└─ Upload file to Google Drive
   └─ If success: ✅ Return file metadata
```

---

## 📊 File Naming Convention

Files are named with format: `{email}@{timestamp}{extension}`

Example:
```
User: khairibo@example.com
File: resume.pdf
Timestamp: 1715000000000 (May 6, 2024 13:00:00 GMT)
Upload time: 14:05:30 UTC

Stored as: khairibo@example.com@1715000000000.pdf

Result in Drive: khairibo@example.com@1715000000000.pdf
```

Benefits:
- ✅ Unique (timestamp ensures no duplicates)
- ✅ Traceable (user email included)
- ✅ Sortable by time
- ✅ Readable

---

## 🔄 Error Handling Flow

```
Upload Request
│
├─ Authentication Check
│  └─ If not logged in: ❌ 401 Unauthorized
│
├─ File Validation
│  ├─ If no file: ❌ 400 No file uploaded
│  ├─ If too large: ❌ 400 File size exceeds limit
│  └─ If wrong type: ❌ (blocked by multer)
│
├─ Google Drive Config Check
│  ├─ If GOOGLE_CLIENT_EMAIL missing: ❌ Config error
│  ├─ If GOOGLE_PRIVATE_KEY missing: ❌ Config error
│  ├─ If GOOGLE_DRIVE_FOLDER_ID missing: ❌ Config error
│  └─ If driveClient not initialized: ❌ Init error
│
├─ Google Drive API Call
│  ├─ If permission denied: ❌ Service Account not shared
│  ├─ If folder not found: ❌ GOOGLE_DRIVE_FOLDER_ID invalid
│  ├─ If rate limited: ❌ Too many requests
│  └─ If other error: ❌ Show error message
│
└─ Success
   ├─ Return file metadata
   ├─ Log success message
   └─ Frontend shows success message
```

---

## ✨ Complete Solution Components

```
Your System:
├─ .env file (secrets)
│  ├─ GOOGLE_CLIENT_EMAIL
│  ├─ GOOGLE_PRIVATE_KEY  
│  ├─ GOOGLE_PROJECT_ID
│  └─ GOOGLE_DRIVE_FOLDER_ID
│
├─ api/server.js (backend)
│  ├─ uploadFileToGoogleDrive() function
│  ├─ JWT initialization
│  ├─ Error handling
│  └─ Logging
│
├─ public/js/app.js (frontend)
│  ├─ File input element
│  ├─ handleFileUpload() function
│  ├─ Error message display
│  └─ Success message display
│
└─ Google Cloud
   ├─ Service Account (portfolio-uploader)
   ├─ Private Key (JSON downloaded)
   └─ Google Drive Folder (shared)
```

---

## 🎯 Key Takeaway

The entire upload system depends on these 4 environment variables:

```
✓ GOOGLE_CLIENT_EMAIL     → WHO is uploading
✓ GOOGLE_PRIVATE_KEY      → HOW to prove you're authorized
✓ GOOGLE_PROJECT_ID       → WHICH project owns this
✓ GOOGLE_DRIVE_FOLDER_ID  → WHERE files go
```

Without any one of these, uploads will fail with "Google Drive not configured".

---

## 🔍 Debug Checklist

When debugging upload issues, check in this order:

```
1. Server starts?
   └─ Does server log show "✅ Google Drive API initialized"?
   └─ If not: Check .env for GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY

2. File selected?
   └─ Does browser console show POST to /api/upload?
   └─ Check Network tab for request

3. Authentication?
   └─ Is user logged in?
   └─ Do you see auth cookie in headers?

4. Server receives file?
   └─ Does server log show upload attempt?
   └─ Check if driveClient is initialized

5. Google Drive request fails?
   └─ Check error message (permission, folder not found, etc.)
   └─ Verify Service Account has Editor permission on folder

6. File appears in Drive?
   └─ Check the shared folder in Google Drive
   └─ File should appear in a few seconds
```

That's the complete architecture! Now you understand how the upload system works end-to-end. 🚀
