import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import {
  getFolders,
  getAllFolders,
  saveFolder,
  updateFolder,
  deleteFolderPermanently,
  logActivity,
  SaaSFolder,
} from '@/lib/db-saas';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const parentId = searchParams.has('parentId') ? searchParams.get('parentId') || null : null;
    const isTrash = searchParams.get('trash') === 'true';

    if (all) {
      const folders = await getAllFolders();
      return NextResponse.json(folders);
    }

    const folders = await getFolders(parentId, isTrash);
    return NextResponse.json(folders);
  } catch (err: any) {
    console.error('GET /api/saas/folders error:', err);
    return NextResponse.json({ error: 'Failed to retrieve folders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, parentId = null, color = '#b8ff4d' } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const newFolder: SaaSFolder = {
      id: 'fld-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      parentId: parentId || null,
      color: color || '#b8ff4d',
      isFavorite: false,
      isTrash: false,
      trashedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveFolder(newFolder);
    await logActivity({
      type: 'folder_create',
      title: 'Created Folder',
      description: `Created folder "${newFolder.name}"`,
      targetId: newFolder.id,
      targetType: 'folder',
    });

    return NextResponse.json(newFolder, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/saas/folders error:', err);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
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
      return NextResponse.json({ error: 'Folder id is required' }, { status: 400 });
    }

    if (updates.isTrash === true && updates.trashedAt === undefined) {
      updates.trashedAt = new Date().toISOString();
    } else if (updates.isTrash === false) {
      updates.trashedAt = null;
    }

    const updated = await updateFolder(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    await logActivity({
      type: 'folder_update',
      title: 'Folder Updated',
      description: `Updated folder "${updated.name}"`,
      targetId: id,
      targetType: 'folder',
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('PATCH /api/saas/folders error:', err);
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: 'Folder id is required' }, { status: 400 });
    }

    await deleteFolderPermanently(id);
    await logActivity({
      type: 'folder_delete',
      title: 'Deleted Folder',
      description: `Permanently deleted folder ${id}`,
      targetId: id,
      targetType: 'folder',
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('DELETE /api/saas/folders error:', err);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}

