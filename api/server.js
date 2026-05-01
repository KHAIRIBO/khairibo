require("dotenv").config();
const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
app.use(express.static(path.join(__dirname, "..", "public")));

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
  res.sendFile(path.resolve(__dirname, "..", "public", "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
