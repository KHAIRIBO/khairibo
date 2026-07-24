import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Fallback in-memory list if Supabase is not configured
let localFiles: any[] = [];


function getSupabase() {
  if (!supabaseUrl) return null;
  const key = supabaseServiceKey || supabasePublishableKey;
  if (!key) return null;
  return createClient(supabaseUrl, key);
}

// ── GET: list all public files ──────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('public', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json(data);
      }
    }
    return NextResponse.json(localFiles);
  } catch {
    return NextResponse.json(localFiles);
  }
}

// ── POST: create a new file / text snippet ──────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, size, type, url, content, allow_download = true, is_text = false } = body;

    const newFile = {
      id: "file-" + Date.now(),
      name: name || "Shared Snippet.txt",
      size: size || "0.05 MB",
      type: type || (is_text ? "text/plain" : "file"),
      url: url || "",
      content: content || "",
      public: true,
      allow_download: allow_download ?? true,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('files')
          .insert([{
            name: newFile.name,
            size: newFile.size,
            type: newFile.type,
            url: newFile.url,
            content: newFile.content,
            public: true,
            allow_download: newFile.allow_download,
          }])
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json(data, { status: 201 });
        }
      } catch {
        // fall through to local
      }
    }

    localFiles.unshift(newFile);
    return NextResponse.json(newFile, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE: remove a file by id ─────────────────────────────────────────────
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    // Always remove from in-memory fallback
    localFiles = localFiles.filter(f => f.id !== id);

    // Remove from Supabase if configured
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('files').delete().eq('id', id);
      } catch {
        // Supabase not reachable, local deletion was enough
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
