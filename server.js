require("dotenv").config();
const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { google } = require("googleapis");
const stream = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = "https://jakurlvpoztwzsgpukja.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impha3VybHZwb3p0d3pzZ3B1a2phIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUzODM2OCwiZXhwIjoyMDkzMTE0MzY4fQ.8yFGJpMXyFErt4qPxv5Urlyrab-HSR3GDSYfVHHUYbw";
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

app.use(express.static(__dirname));
app.use(express.json());
app.use(cookieParser());

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// --- Google API Setup ---
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

let drive, calendar;
if (GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY
    },
    scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/calendar']
  });
  drive = google.drive({ version: 'v3', auth });
  calendar = google.calendar({ version: 'v3', auth });
}

// --- AUTHENTICATION ---
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing credentials" });

  const { data: user, error } = await adminClient.from("admin_users").select("*").eq("username", username).single();
  if (error || !user) return res.status(401).json({ error: "Invalid credentials" });
  
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
  res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 });
  res.json({ success: true });
});

app.post("/api/admin/logout", (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
});

app.get("/api/admin/me", (req, res) => {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

const requireAdmin = (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- NOTES API ---
app.get("/api/admin/notes", requireAdmin, async (req, res) => {
  const { data, error } = await adminClient.from("notes").select("*").order("created_at", { ascending: false });
  res.json(error ? { error: error.message } : { data });
});

app.post("/api/admin/notes", requireAdmin, async (req, res) => {
  const { title, content } = req.body;
  const { data, error } = await adminClient.from("notes").insert([{ title, content }]).select();
  res.json(error ? { error: error.message } : { success: true, data });
});

app.put("/api/admin/notes/:id", requireAdmin, async (req, res) => {
  const { title, content } = req.body;
  const { error } = await adminClient.from("notes").update({ title, content, updated_at: new Date() }).eq("id", req.params.id);
  res.json(error ? { error: error.message } : { success: true });
});

app.delete("/api/admin/notes/:id", requireAdmin, async (req, res) => {
  const { error } = await adminClient.from("notes").delete().eq("id", req.params.id);
  res.json(error ? { error: error.message } : { success: true });
});

// --- GOOGLE DRIVE UPLOAD ---
app.get("/api/admin/files", requireAdmin, async (req, res) => {
  const { data, error } = await adminClient.from("files").select("*").order("uploaded_at", { ascending: false });
  res.json(error ? { error: error.message } : { data });
});

app.post("/api/admin/upload", requireAdmin, upload.single('file'), async (req, res) => {
  if (!drive) return res.status(500).json({ error: "Google Drive is not configured." });
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const driveRes = await drive.files.create({
      requestBody: { name: req.file.originalname },
      media: { mimeType: req.file.mimetype, body: bufferStream },
      fields: 'id, webViewLink'
    });

    // Make file shareable (anyone with link can read)
    await drive.permissions.create({
      fileId: driveRes.data.id,
      requestBody: { role: 'reader', type: 'anyone' }
    });

    const fileData = {
      original_name: req.file.originalname,
      drive_file_id: driveRes.data.id,
      drive_link: driveRes.data.webViewLink,
      shareable_link: driveRes.data.webViewLink,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size
    };

    const { data, error } = await adminClient.from("files").insert([fileData]).select();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/files/:id", requireAdmin, async (req, res) => {
  try {
    const { data: file } = await adminClient.from("files").select("drive_file_id").eq("id", req.params.id).single();
    if (file && file.drive_file_id && drive) {
      await drive.files.delete({ fileId: file.drive_file_id }).catch(() => {}); // ignore errors if already deleted
    }
    const { error } = await adminClient.from("files").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- GOOGLE CALENDAR ---
app.get("/api/admin/events", requireAdmin, async (req, res) => {
  const { data, error } = await adminClient.from("events").select("*").order("start_datetime", { ascending: true });
  res.json(error ? { error: error.message } : { data });
});

app.post("/api/admin/events", requireAdmin, async (req, res) => {
  const { title, description, start_datetime, end_datetime } = req.body;
  if (!calendar || !GOOGLE_CALENDAR_ID) return res.status(500).json({ error: "Google Calendar not configured." });

  try {
    const eventRes = await calendar.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      requestBody: {
        summary: title,
        description: description,
        start: { dateTime: new Date(start_datetime).toISOString() },
        end: { dateTime: new Date(end_datetime).toISOString() },
      }
    });

    const eventData = {
      title, description, start_datetime, end_datetime,
      google_event_id: eventRes.data.id
    };

    const { data, error } = await adminClient.from("events").insert([eventData]).select();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/events/:id", requireAdmin, async (req, res) => {
  try {
    const { data: event } = await adminClient.from("events").select("google_event_id").eq("id", req.params.id).single();
    if (event && event.google_event_id && calendar && GOOGLE_CALENDAR_ID) {
      await calendar.events.delete({ calendarId: GOOGLE_CALENDAR_ID, eventId: event.google_event_id }).catch(() => {});
    }
    const { error } = await adminClient.from("events").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generic Delete and Update for existing tables
const allowedAdminTables = new Set(["projects", "contacts", "contact_submissions", "about", "blog_posts"]);

app.delete("/api/admin/:table/:id", requireAdmin, async (req, res, next) => {
  const { table, id } = req.params;
  if (['notes', 'files', 'events'].includes(table)) return next(); // Already handled above
  if (!allowedAdminTables.has(table)) return res.status(400).json({ success: false, error: "Table not allowed" });
  
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return res.status(400).json({ success: false, error: "Invalid id" });

  try {
    const { error } = await adminClient.from(table).delete().eq("id", numericId);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/admin/:table", requireAdmin, async (req, res, next) => {
  const { table } = req.params;
  if (['notes', 'files', 'events'].includes(table)) return next();
  if (!allowedAdminTables.has(table)) return res.status(400).json({ success: false, error: "Table not allowed" });

  try {
    const { data, error } = await adminClient.from(table).select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/admin/:table/:id", requireAdmin, async (req, res, next) => {
  const { table, id } = req.params;
  if (['notes', 'files', 'events'].includes(table)) return next();
  const payload = req.body || {};
  const editableTables = new Set(["projects", "contacts", "about", "blog_posts"]);
  if (!editableTables.has(table)) return res.status(400).json({ success: false, error: "Table not allowed" });
  
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return res.status(400).json({ success: false, error: "Invalid id" });

  try {
    const { error } = await adminClient.from(table).update(payload).eq("id", numericId);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/admin', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'admin.html')); });
app.get('/admin.html', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'admin.html')); });

// Static files
app.use(express.static(path.join(__dirname, "public")));

// SPA fallback
app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")); });

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
