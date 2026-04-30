// Supabase client initialization
const SUPABASE_URL = "https://jakurlvpoztwzsgpukja.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impha3VybHZwb3p0d3pzZ3B1a2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzgzNjgsImV4cCI6MjA5MzExNDM2OH0.IhJjbY8w36zw4Z4KyutxjXIwKJi_oxWcpVjUrPoa1YY";

// Initialize Supabase client with ESM import from CDN
export async function initSupabase() {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.0");
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Fetch projects from Supabase
export async function fetchProjects() {
  try {
    const supabase = await initSupabase();
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching projects:", err);
    return [];
  }
}

// Fetch contacts from Supabase
export async function fetchContacts() {
  try {
    const supabase = await initSupabase();
    const { data, error } = await supabase.from("contacts").select("*");
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching contacts:", err);
    return [];
  }
}

// Fetch about info from Supabase
export async function fetchAbout() {
  try {
    const supabase = await initSupabase();
    const { data, error } = await supabase.from("about").select("*").single();
    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  } catch (err) {
    console.error("Error fetching about:", err);
    return null;
  }
}

// Fetch contact submissions from Supabase
export async function fetchContactSubmissions() {
  try {
    const supabase = await initSupabase();
    const { data, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching contact submissions:", err);
    return [];
  }
}

// Submit contact form to Supabase
export async function submitContactForm(name, email, message) {
  try {
    const supabase = await initSupabase();
    const { data, error } = await supabase.from("contact_submissions").insert([{ name, email, message, created_at: new Date() }]);
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("Error submitting contact form:", err);
    return { success: false, error: err.message };
  }
}

// Delete project from Supabase
export async function deleteProject(id) {
  try {
    const response = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error || "Failed to delete project");
    }
    return { success: true };
  } catch (err) {
    console.error("Error deleting project:", err);
    return { success: false, error: err.message };
  }
}

// Delete contact submission from Supabase
export async function deleteContactSubmission(id) {
  try {
    const response = await fetch(`/api/admin/contact_submissions/${id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error || "Failed to delete submission");
    }
    return { success: true };
  } catch (err) {
    console.error("Error deleting contact submission:", err);
    return { success: false, error: err.message };
  }
}

// Delete contact from Supabase
export async function deleteContact(id) {
  try {
    const response = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error || "Failed to delete contact");
    }
    return { success: true };
  } catch (err) {
    console.error("Error deleting contact:", err);
    return { success: false, error: err.message };
  }
}

// Update a project through the server API
export async function updateProject(id, payload) {
  try {
    const response = await fetch(`/api/admin/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const payloadResponse = await response.json();
    if (!response.ok || !payloadResponse.success) {
      throw new Error(payloadResponse.error || "Failed to update project");
    }
    return { success: true };
  } catch (err) {
    console.error("Error updating project:", err);
    return { success: false, error: err.message };
  }
}

// Update a contact through the server API
export async function updateContact(id, payload) {
  try {
    const response = await fetch(`/api/admin/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const payloadResponse = await response.json();
    if (!response.ok || !payloadResponse.success) {
      throw new Error(payloadResponse.error || "Failed to update contact");
    }
    return { success: true };
  } catch (err) {
    console.error("Error updating contact:", err);
    return { success: false, error: err.message };
  }
}

// Update about section through the server API
export async function updateAbout(id, payload) {
  try {
    const response = await fetch(`/api/admin/about/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const payloadResponse = await response.json();
    if (!response.ok || !payloadResponse.success) {
      throw new Error(payloadResponse.error || "Failed to update about");
    }
    return { success: true };
  } catch (err) {
    console.error("Error updating about:", err);
    return { success: false, error: err.message };
  }
}

