import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import {
  getNotes,
  saveNote,
  updateNote,
  deleteNotePermanently,
  logActivity,
  SaaSNote,
} from '@/lib/db-saas';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.has('folderId') ? searchParams.get('folderId') || null : undefined;
    const category = searchParams.get('category') || undefined;
    const isPinned = searchParams.has('pinned') ? searchParams.get('pinned') === 'true' : undefined;
    const isFavorite = searchParams.has('favorite') ? searchParams.get('favorite') === 'true' : undefined;
    const isTrash = searchParams.has('trash') ? searchParams.get('trash') === 'true' : undefined;
    const search = searchParams.get('search') || undefined;

    const notes = await getNotes({ folderId, category, isPinned, isFavorite, isTrash, search });
    return NextResponse.json(notes);
  } catch (err: any) {
    console.error('GET /api/saas/notes error:', err);
    return NextResponse.json({ error: 'Failed to retrieve notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title = 'Untitled Note',
      content = '',
      category = 'General',
      tags = [],
      folderId = null,
      isPinned = false,
    } = body;

    const newNote: SaaSNote = {
      id: 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: title.trim() || 'Untitled Note',
      content: content || '',
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : [],
      folderId: folderId || null,
      isPinned: Boolean(isPinned),
      isFavorite: false,
      isTrash: false,
      trashedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveNote(newNote);
    await logActivity({
      type: 'note_create',
      title: 'Created Note',
      description: `Created note "${newNote.title}"`,
      targetId: newNote.id,
      targetType: 'note',
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/saas/notes error:', err);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Note id is required' }, { status: 400 });
    }

    if (updates.isTrash === true && updates.trashedAt === undefined) {
      updates.trashedAt = new Date().toISOString();
    } else if (updates.isTrash === false) {
      updates.trashedAt = null;
    }

    const updated = await updateNote(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Only log significant activity if not pure typing/autosave
    if (updates.title || updates.isPinned !== undefined || updates.isTrash !== undefined) {
      await logActivity({
        type: 'note_update',
        title: 'Note Updated',
        description: `Updated note "${updated.title}"`,
        targetId: id,
        targetType: 'note',
      });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('PATCH /api/saas/notes error:', err);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const emptyTrash = searchParams.get('emptyTrash') === 'true';

    if (emptyTrash) {
      const trashed = await getNotes({ isTrash: true });
      for (const n of trashed) {
        await deleteNotePermanently(n.id);
      }
      await logActivity({
        type: 'note_delete',
        title: 'Emptied Trash Notes',
        description: `Permanently deleted ${trashed.length} notes from trash`,
        targetType: 'note',
      });
      return NextResponse.json({ success: true, count: trashed.length });
    }

    if (!id) {
      return NextResponse.json({ error: 'Note id is required' }, { status: 400 });
    }

    await deleteNotePermanently(id);
    await logActivity({
      type: 'note_delete',
      title: 'Deleted Note',
      description: `Permanently deleted note ${id}`,
      targetId: id,
      targetType: 'note',
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('DELETE /api/saas/notes error:', err);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}

