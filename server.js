require("dotenv").config();
const express = require("express");
const path = require("path");

const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// PostgreSQL Connection Pool (for Vercel Postgres / Neon)
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Database test route
app.get("/api/db-test", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Supabase test route
app.get("/api/supabase-test", async (req, res) => {
  try {
    const { data, error } = await supabase.from("_dummy_test").select("*").limit(1);
    // Note: _dummy_test might not exist, but a 404/error from supabase still confirms connectivity
    res.json({ success: true, connected: true, error: error ? error.message : null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SPA fallback - always serve index.html for any route not caught by static
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

