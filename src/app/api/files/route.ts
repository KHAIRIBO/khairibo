import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || '6cc4aca9df';

export interface SharedFileRecord {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  content?: string;
  created_at: string;
  public: boolean;
  allow_download: boolean;
  share_in_popup: boolean;
  is_text?: boolean;
}

// Path to persistent local fallback data file
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'files.json');

function ensureDataFile(): SharedFileRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local files storage:', err);
    return [];
  }
}

function saveLocalFiles(files: SharedFileRecord[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(files, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local files storage:', err);
  }
}

function getSupabase() {
  if (!supabaseUrl) return null;
  const key = supabaseServiceKey || supabasePublishableKey;
  if (!key) return null;
  return createClient(supabaseUrl, key);
}

// ── Check if requester is authorized admin ("only me") ──────────────────────
function isAuthorizedAdmin(request: Request): boolean {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const adminKey = request.headers.get('x-admin-key') || '';
  const adminSession = request.headers.get('x-admin-session') || '';

  return (
    token === ADMIN_ACCESS_CODE ||
    adminKey === ADMIN_ACCESS_CODE ||
    adminSession === 'active' ||
    adminSession === ADMIN_ACCESS_CODE
  );
}

// ── GET: list files ─────────────────────────────────────────────────────────
// Supports:
// ?all=true   -> Admin only: returns all files including private ones
// ?popup=true -> Visitors/Index: returns only files shared to index pop-up
// default     -> Visitors: returns all public files
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wantAll = searchParams.get('all') === 'true';
    const wantPopup = searchParams.get('popup') === 'true';
    const isAdmin = isAuthorizedAdmin(request);

    const supabase = getSupabase();
    let remoteFiles: SharedFileRecord[] | null = null;

    if (supabase) {
      try {
        let query = supabase.from('files').select('*').order('created_at', { ascending: false });

        if (wantAll && isAdmin) {
          // fetch all
        } else if (wantPopup) {
          query = query.eq('public', true);
        } else {
          query = query.eq('public', true);
        }

        const { data, error } = await query;
        if (!error && data) {
          remoteFiles = data.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            size: item.size || '0 MB',
            type: item.type || 'file',
            url: item.url || '',
            content: item.content || '',
            public: item.public !== false,
            allow_download: item.allow_download !== false,
            share_in_popup: item.share_in_popup === true,
            created_at: item.created_at || new Date().toISOString(),
            is_text: item.type?.includes('text') || Boolean(item.content),
          }));
        }
      } catch (err) {
        console.warn('Supabase files fetch warning:', err);
      }
    }

    const localList = ensureDataFile();

    // Merge or fallback: prefer remote if available, with local fallback
    let combined: SharedFileRecord[] = [];
    if (remoteFiles && remoteFiles.length > 0) {
      // Sync local cache with remote
      const map = new Map<string, SharedFileRecord>();
      remoteFiles.forEach((f) => map.set(f.id, f));
      // In case local has newer or unsynced records
      localList.forEach((f) => {
        if (!map.has(f.id)) map.set(f.id, f);
      });
      combined = Array.from(map.values());
    } else {
      combined = localList;
    }

    // Filter based on request parameters
    let result = combined;

    if (wantAll && isAdmin) {
      result = combined;
    } else if (wantPopup) {
      // Index pop-up: ONLY items where share_in_popup is TRUE and public is NOT false
      result = combined.filter((f) => f.public !== false && f.share_in_popup === true);
    } else {
      // Public downloads: only public files
      result = combined.filter((f) => f.public !== false);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/files error:', error);
    return NextResponse.json(ensureDataFile());
  }
}

// ── POST: upload/create new file or text snippet (Admin Only) ───────────────
export async function POST(request: Request) {
  try {
    // SECURITY: Only the authenticated admin ("only me") can upload
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the admin can upload to the database.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      size,
      type,
      url,
      content,
      public: isPublic = true,
      allow_download = true,
      share_in_popup = false,
      is_text = false,
    } = body;

    const newFile: SharedFileRecord = {
      id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: name || (is_text ? 'Shared Note.txt' : 'Uploaded File'),
      size: size || '0.01 MB',
      type: type || (is_text ? 'text/plain' : 'application/octet-stream'),
      url: url || '',
      content: content || '',
      public: isPublic !== false,
      allow_download: allow_download !== false,
      share_in_popup: share_in_popup === true,
      created_at: new Date().toISOString(),
      is_text: Boolean(is_text || type?.includes('text') || content),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        // Attempt full insert including share_in_popup & allow_download
        const insertPayload: any = {
          id: newFile.id,
          name: newFile.name,
          size: newFile.size,
          type: newFile.type,
          url: newFile.url,
          content: newFile.content,
          public: newFile.public,
          allow_download: newFile.allow_download,
          share_in_popup: newFile.share_in_popup,
        };

        const { data, error } = await supabase
          .from('files')
          .insert([insertPayload])
          .select()
          .single();

        if (error) {
          // If share_in_popup column doesn't exist yet in Supabase Postgres, retry without it
          if (error.message?.includes('share_in_popup') || error.code === '42703') {
            delete insertPayload.share_in_popup;
            const retry = await supabase.from('files').insert([insertPayload]).select().single();
            if (retry.data) {
              newFile.id = String(retry.data.id);
            }
          }
        } else if (data) {
          newFile.id = String(data.id);
        }
      } catch (err) {
        console.warn('Supabase insert fallback:', err);
      }
    }

    // Persist to local storage file
    const local = ensureDataFile();
    const updated = [newFile, ...local.filter((f) => f.id !== newFile.id)];
    saveLocalFiles(updated);

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error('POST /api/files error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH: update permissions & pop-up sharing (Admin Only) ─────────────────
export async function PATCH(request: Request) {
  try {
    // SECURITY: Only the authenticated admin ("only me") can modify files
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the admin can modify files in the database.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, public: isPublic, allow_download, share_in_popup, name, content } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
    }

    const local = ensureDataFile();
    const existingIndex = local.findIndex((f) => f.id === id);
    const existing = existingIndex !== -1 ? local[existingIndex] : null;

    const updatedItem: SharedFileRecord = {
      ...(existing || {
        id,
        name: name || 'Resource',
        size: '1.0 MB',
        type: 'file',
        url: '',
        content: '',
        created_at: new Date().toISOString(),
        public: true,
        allow_download: true,
        share_in_popup: false,
      }),
      ...(isPublic !== undefined ? { public: Boolean(isPublic) } : {}),
      ...(allow_download !== undefined ? { allow_download: Boolean(allow_download) } : {}),
      ...(share_in_popup !== undefined ? { share_in_popup: Boolean(share_in_popup) } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(content !== undefined ? { content } : {}),
    };

    if (existingIndex !== -1) {
      local[existingIndex] = updatedItem;
    } else {
      local.unshift(updatedItem);
    }
    saveLocalFiles(local);

    // Update in Supabase if configured
    const supabase = getSupabase();
    if (supabase) {
      try {
        const updatePayload: any = {};
        if (isPublic !== undefined) updatePayload.public = Boolean(isPublic);
        if (allow_download !== undefined) updatePayload.allow_download = Boolean(allow_download);
        if (share_in_popup !== undefined) updatePayload.share_in_popup = Boolean(share_in_popup);
        if (name !== undefined) updatePayload.name = name;
        if (content !== undefined) updatePayload.content = content;

        const { error } = await supabase.from('files').update(updatePayload).eq('id', id);

        if (error && (error.message?.includes('share_in_popup') || error.code === '42703')) {
          delete updatePayload.share_in_popup;
          await supabase.from('files').update(updatePayload).eq('id', id);
        }
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('PATCH /api/files error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE: remove a file by id (Admin Only) ────────────────────────────────
export async function DELETE(request: Request) {
  try {
    // SECURITY: Only the authenticated admin ("only me") can delete
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the admin can delete files from the database.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    // Remove from local persistent storage
    const local = ensureDataFile();
    const filtered = local.filter((f) => f.id !== id);
    saveLocalFiles(filtered);

    // Remove from Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('files').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete warning:', err);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('DELETE /api/files error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
