require("dotenv").config();
const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

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

// Middleware
app.use(express.json());
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
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
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
