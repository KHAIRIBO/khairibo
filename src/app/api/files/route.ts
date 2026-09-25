import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { getDb } from '@/lib/mongodb';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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

// ── Local file fallback ──────────────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'files.json');

function readLocal(): SharedFileRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) { fs.writeFileSync(DATA_FILE, '[]', 'utf8'); return []; }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch { return []; }
}

function writeLocal(files: SharedFileRecord[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(files, null, 2), 'utf8');
  } catch (err) { console.error('Local write error:', err); }
}

// ── Supabase storage (for file uploads only, optional) ───────────────────────
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ── Admin auth check ─────────────────────────────────────────────────────────
function isAdmin(request: Request): boolean {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  const key = request.headers.get('x-admin-key') || '';
  const session = request.headers.get('x-admin-session') || '';
  return (
    token === ADMIN_ACCESS_CODE ||
    key === ADMIN_ACCESS_CODE ||
    session === 'active' ||
    session === ADMIN_ACCESS_CODE
  );
}

// ── GET ──────────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wantAll = searchParams.get('all') === 'true';
    const wantPopup = searchParams.get('popup') === 'true';
    const admin = isAdmin(request);

    let files: SharedFileRecord[] = [];

    // 1. Try MongoDB first
    const db = await getDb();
    if (db) {
      const query: Record<string, unknown> = {};
      if (!wantAll || !admin) query.public = true;
      if (wantPopup) query.share_in_popup = true;

      const docs = await db
        .collection('files')
        .find(query)
        .sort({ created_at: -1 })
        .toArray();

      files = docs.map((doc) => ({
        id: doc._id?.toString() || doc.id,
        name: doc.name,
        size: doc.size || '0 KB',
        type: doc.type || 'file',
        url: doc.url || '',
        content: doc.content || '',
        public: doc.public !== false,
        allow_download: doc.allow_download !== false,
        share_in_popup: doc.share_in_popup === true,
        created_at: doc.created_at || new Date().toISOString(),
        is_text: Boolean(doc.is_text || doc.content),
      }));
    } else {
      // 2. Fallback to local file storage
      const local = readLocal();
      if (wantPopup) {
        files = local.filter((f) => f.public !== false && f.share_in_popup === true);
      } else if (!wantAll || !admin) {
        files = local.filter((f) => f.public !== false);
      } else {
        files = local;
      }
    }

    return NextResponse.json(files);
  } catch (err) {
    console.error('GET /api/files error:', err);
    return NextResponse.json(readLocal());
  }
}

// ── POST (Admin only) ────────────────────────────────────────────────────────
export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Only admin can upload.' },
      { status: 401 }
    );
  }

  try {
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
      name: name || (is_text ? 'Note.txt' : 'Uploaded File'),
      size: size || '0.01 MB',
      type: type || (is_text ? 'text/plain' : 'application/octet-stream'),
      url: url || '',
      content: content || '',
      public: isPublic !== false,
      allow_download: allow_download !== false,
      share_in_popup: share_in_popup === true,
      created_at: new Date().toISOString(),
      is_text: Boolean(is_text || content),
    };

    // Save to MongoDB
    const db = await getDb();
    if (db) {
      const { id: _ignoreId, ...docWithoutId } = newFile;
      const result = await db.collection('files').insertOne(docWithoutId);
      newFile.id = result.insertedId.toString();
    }

    // Always keep local fallback in sync
    const local = readLocal();
    writeLocal([newFile, ...local.filter((f) => f.id !== newFile.id)]);

    return NextResponse.json(newFile, { status: 201 });
  } catch (err) {
    console.error('POST /api/files error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH (Admin only) ───────────────────────────────────────────────────────
export async function PATCH(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Only admin can modify files.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, public: isPublic, allow_download, share_in_popup, name, content } = body;

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const updateFields: Record<string, unknown> = {};
    if (isPublic !== undefined) updateFields.public = Boolean(isPublic);
    if (allow_download !== undefined) updateFields.allow_download = Boolean(allow_download);
    if (share_in_popup !== undefined) updateFields.share_in_popup = Boolean(share_in_popup);
    if (name !== undefined) updateFields.name = name;
    if (content !== undefined) updateFields.content = content;

    // Update MongoDB
    const db = await getDb();
    if (db) {
      await db.collection('files').updateOne(
        { id },
        { $set: updateFields },
        { upsert: false }
      );
    }

    // Update local fallback
    const local = readLocal();
    const updated = local.map((f) =>
      f.id === id ? { ...f, ...updateFields } : f
    );
    writeLocal(updated);

    const result = updated.find((f) => f.id === id);
    return NextResponse.json(result || { id, ...updateFields });
  } catch (err) {
    console.error('PATCH /api/files error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE (Admin only) ──────────────────────────────────────────────────────
export async function DELETE(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Only admin can delete files.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Delete from MongoDB
    const db = await getDb();
    if (db) {
      await db.collection('files').deleteOne({ id });
    }

    // Delete from local fallback
    const local = readLocal();
    writeLocal(local.filter((f) => f.id !== id));

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('DELETE /api/files error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
