require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const stream = require("stream");
const { createClient } = require("@supabase/supabase-js");
const { OAuth2Client } = require("google-auth-library");
const multer = require("multer");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:3001,https://khairibouzakher.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};
const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;
const sessionCookieName = "kbo_session";
const sessionSecret = process.env.SESSION_SECRET || "";

// Google Drive API Setup
const googleClientEmail = process.env.GOOGLE_CLIENT_EMAIL || "";
const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n") : "";
const googleDriveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "";

let driveClient = null;
if (googleClientEmail && googlePrivateKey) {
  try {
    const jwtClient = new google.auth.JWT({
      email: googleClientEmail,
      key: googlePrivateKey,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    driveClient = google.drive({ version: "v3", auth: jwtClient });
    console.log("Google Drive API initialized successfully");
  } catch (err) {
    console.error("Google Drive API initialization failed:", err.message);
  }
}

// Multer Setup - Store in memory temporarily
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/zip",
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error("File type not allowed"), false);
    }
    cb(null, true);
  },
});

// Supabase Initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key server-side for full access; fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.error("Supabase initialization failed:", err);
  }
}

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((acc, chunk) => {
    const [key, ...valueParts] = chunk.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(valueParts.join("="));
    return acc;
  }, {});
};

const createSessionToken = (payload) => {
  if (!sessionSecret) return null;
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", sessionSecret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
};

const verifySessionToken = (token) => {
  if (!token || !sessionSecret) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(encodedPayload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (actualBuffer.length !== expectedBuffer.length) {
    return null;
  }
  if (!crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (err) {
    return null;
  }
};

const setSessionCookie = (res, token) => {
  const maxAgeSeconds = 60 * 60 * 24 * 7;
  const isSecure = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${isSecure ? "; Secure" : ""}`);
};

const clearSessionCookie = (res) => {
  const isSecure = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isSecure ? "; Secure" : ""}`);
};

// Upload file to Google Drive
const uploadFileToGoogleDrive = async (fileBuffer, fileName, mimeType) => {
  if (!driveClient || !googleDriveFolderId) {
    throw new Error("Google Drive not configured");
  }

  try {
    const bufferStream = stream.Readable.from([fileBuffer]);
    const response = await driveClient.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType,
        parents: [googleDriveFolderId],
        properties: {
          uploadedAt: new Date().toISOString(),
          uploadedBy: "portfolio-app",
        },
      },
      media: {
        mimeType: mimeType,
        body: bufferStream,
      },
      fields: "id, webViewLink, name, size, createdTime",
    });

    return {
      fileId: response.data.id,
      fileName: response.data.name,
      size: response.data.size,
      webViewLink: response.data.webViewLink,
      createdTime: response.data.createdTime,
    };
  } catch (err) {
    throw new Error(`Failed to upload file to Google Drive: ${err.message}`);
  }
};

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    return next();
  }

  return res.status(403).json({ error: "Origin not allowed" });
});

// Dynamic sitemap — must come BEFORE express.static
app.get("/sitemap.xml", (req, res) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const base = `${protocol}://${host}`;
  const today = new Date().toISOString().split("T")[0];
  const urls = [
    { loc: `${base}/`,     changefreq: "weekly", priority: "1.0" },
    { loc: `${base}/blog`, changefreq: "weekly", priority: "0.8" },
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
  res.header("Content-Type", "application/xml");
  res.send(xml);
});

// Dynamic robots.txt — must come BEFORE express.static
app.get("/robots.txt", (req, res) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const base = `${protocol}://${host}`;
  res.header("Content-Type", "text/plain");
  res.send(`User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /admin\n\nSitemap: ${base}/sitemap.xml\n`);
});

app.use(express.static(path.join(__dirname, "..", "public")));

// Blog Endpoints
app.get("/api/blogs", async (req, res) => {
  if (!supabase) return res.json([]); // Return empty instead of 500
  try {
    const { data, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    if (error) {
      console.warn("Blogs table might not exist:", error.message);
      return res.json([]); 
    }
    res.json(data || []);
  } catch (err) {
    console.error("Blog fetch error:", err);
    res.json([]);
  }
});

app.get("/api/blogs/:id", async (req, res) => {
  if (!supabase) return res.status(404).json({ error: "Not found" });
  try {
    const { data, error } = await supabase.from("blogs").select("*").eq("id", req.params.id).single();
    if (error) return res.status(404).json({ error: "Post not found" });
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});

// Get Supabase config for frontend
app.get("/api/config", (req, res) => {
  res.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    googleClientId
  });
});

app.post("/api/auth/google", async (req, res) => {
  if (!googleClientId || !googleClient) {
    return res.status(500).json({ success: false, error: "Google auth is not configured" });
  }
  if (!sessionSecret) {
    return res.status(500).json({ success: false, error: "Session secret is not configured" });
  }

  const { idToken } = req.body || {};
  if (!idToken) {
    return res.status(400).json({ success: false, error: "Missing Google ID token" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      return res.status(401).json({ success: false, error: "Invalid token payload" });
    }

    const sessionPayload = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture || "",
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    const sessionToken = createSessionToken(sessionPayload);
    if (!sessionToken) {
      return res.status(500).json({ success: false, error: "Failed to create session" });
    }

    setSessionCookie(res, sessionToken);
    return res.json({ success: true, user: sessionPayload });
  } catch (err) {
    return res.status(401).json({ success: false, error: "Google token verification failed" });
  }
});

app.get("/api/user", (req, res) => {
  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies[sessionCookieName];
  const session = verifySessionToken(token);

  if (!session) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    user: {
      sub: session.sub,
      email: session.email,
      name: session.name,
      picture: session.picture,
    },
  });
});

app.post("/api/logout", (req, res) => {
  clearSessionCookie(res);
  return res.json({ success: true });
});

// File Upload to Google Drive
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    // Check authentication
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies[sessionCookieName];
    const session = verifySessionToken(token);

    if (!session) {
      return res.status(401).json({ success: false, error: "Unauthorized: Please sign in first" });
    }

    // Validate file
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    // Validate file size (should already be checked by multer, but double-check)
    if (req.file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: "File size exceeds 50MB limit" });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${session.email}-${timestamp}${fileExt}`;

    // Upload to Google Drive
    const uploadResult = await uploadFileToGoogleDrive(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    return res.json({
      success: true,
      file: uploadResult,
      message: "File uploaded successfully to Google Drive",
    });
  } catch (err) {
    console.error("File upload error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin upload endpoint - protected by admin password (env ADMIN_PASSWORD or fallback)
app.post("/api/admin-upload", upload.single("file"), async (req, res) => {
  try {
    const adminPasswordProvided = req.body && req.body.adminPassword ? String(req.body.adminPassword) : "";
    const adminPasswordEnv = process.env.ADMIN_PASSWORD || "6cc4aca9df";

    if (!adminPasswordProvided || adminPasswordProvided !== adminPasswordEnv) {
      return res.status(401).json({ success: false, error: "Unauthorized: invalid admin password" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    if (req.file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: "File size exceeds 50MB limit" });
    }

    const timestamp = Date.now();
    const fileExt = path.extname(req.file.originalname) || "";
    const fileName = `admin-upload-${timestamp}${fileExt}`;

    const uploadResult = await uploadFileToGoogleDrive(req.file.buffer, fileName, req.file.mimetype);

    return res.json({ success: true, file: uploadResult, message: "Admin file uploaded successfully" });
  } catch (err) {
    console.error("Admin upload error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Save data to Supabase
app.post("/api/save", async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, error: "Supabase not configured" });
  const { table, data } = req.body;
  if (!table || !data) return res.status(400).json({ success: false, error: "Missing table or data" });

  try {
    const { error } = await supabase.from(table).insert([data]);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Supabase Health Check
app.get("/api/db-status", async (req, res) => {
  if (!supabase) return res.json({ connected: false, error: "Supabase not configured" });
  try {
    const { error } = await supabase.from("_dummy_test").select("*").limit(1);
    res.json({ connected: !error || error.code !== 'PGRST301' }); // Basic check
  } catch (err) {
    res.json({ connected: false });
  }
});

app.get("/api/db-test", async (req, res) => {
  if (!supabase) return res.status(500).json({ success: false, error: "Supabase not configured" });
  try {
    const { data, error } = await supabase.from("_dummy_test").select("*").limit(1);
    res.json({ 
      success: true, 
      connected: true, 
      error: error ? error.message : null 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// SPA fallback
app.get("*", (req, res) => {
  const indexPath = path.resolve(__dirname, "..", "public", "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Failed to send index.html:", err);
      res.status(500).send("Internal Server Error: Missing index.html");
    }
  });
});

if (require.main === module) {
  const startServer = (port) => {
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        const nextPort = parseInt(port, 10) + 1;
        console.warn(`Port ${port} in use, attempting ${nextPort}...`);
        // try next port once
        startServer(nextPort);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  };

  startServer(PORT);
}

module.exports = app;
