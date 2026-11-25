import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import {
  getFiles,
  saveFile,
  updateFile,
  deleteFilePermanently,
  detectFileType,
  formatBytes,
  logActivity,
  SaaSFile,
} from '@/lib/db-saas';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB max per file

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.has('folderId') ? (searchParams.get('folderId') || null) : undefined;
    const type = searchParams.get('type') || undefined;
    const isFavorite = searchParams.has('favorite') ? searchParams.get('favorite') === 'true' : undefined;
    const isTrash = searchParams.has('trash') ? searchParams.get('trash') === 'true' : undefined;
    const search = searchParams.get('search') || undefined;

    const files = await getFiles({ folderId, type, isFavorite, isTrash, search });
    return NextResponse.json(files);
  } catch (err: any) {
    console.error('GET /api/saas/files error:', err);
    return NextResponse.json({ error: 'Failed to retrieve files' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Support both FormData and JSON payloads
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const uploadedFile = formData.get('file') as File | null;
      const folderId = (formData.get('folderId') as string) || null;

      if (!uploadedFile) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      if (uploadedFile.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File exceeds maximum allowed size of ${formatBytes(MAX_FILE_SIZE_BYTES)}` },
          { status: 400 }
        );
      }

      // Read file buffer to Base64 data URL
      const buffer = Buffer.from(await uploadedFile.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = uploadedFile.type || 'application/octet-stream';
      const dataUrl = `data:${mimeType};base64,${base64}`;

      const ext = uploadedFile.name.split('.').pop() || '';
      const fileType = detectFileType(mimeType, uploadedFile.name);

      const newFile: SaaSFile = {
        id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8),
        name: uploadedFile.name,
        originalName: uploadedFile.name,
        size: formatBytes(uploadedFile.size),
        sizeBytes: uploadedFile.size,
        type: fileType,
        mimeType,
        extension: ext.toLowerCase(),
        url: dataUrl,
        folderId,
        isFavorite: false,
        isTrash: false,
        trashedAt: null,
        public: true,
        allowDownload: true,
        shareInPopup: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveFile(newFile);
      await logActivity({
        type: 'file_upload',
        title: 'Uploaded File',
        description: `Uploaded "${newFile.name}" (${newFile.size})`,
        targetId: newFile.id,
        targetType: 'file',
      });

      return NextResponse.json(newFile, { status: 201 });
    }

    // JSON upload (e.g. from client FileReader / text note)
    const body = await request.json();
    const {
      name,
      originalName,
      size,
      sizeBytes,
      type,
      mimeType,
      url,
      content,
      folderId,
      public: isPublic = true,
      allowDownload = true,
      shareInPopup = false,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    const calculatedSizeBytes = sizeBytes || (url ? Math.round(url.length * 0.75) : (content?.length || 1024));

    if (calculatedSizeBytes > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds maximum allowed size of ${formatBytes(MAX_FILE_SIZE_BYTES)}` },
        { status: 400 }
      );
    }

    const ext = name.split('.').pop() || '';
    const detectedType = type || detectFileType(mimeType || 'application/octet-stream', name);

    const newFile: SaaSFile = {
      id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8),
      name,
      originalName: originalName || name,
      size: size || formatBytes(calculatedSizeBytes),
      sizeBytes: calculatedSizeBytes,
      type: detectedType,
      mimeType: mimeType || 'application/octet-stream',
      extension: ext.toLowerCase(),
      url: url || '',
      content: content || '',
      folderId: folderId || null,
      isFavorite: false,
      isTrash: false,
      trashedAt: null,
      public: isPublic !== false,
      allowDownload: allowDownload !== false,
      shareInPopup: shareInPopup === true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveFile(newFile);
    await logActivity({
      type: 'file_upload',
      title: 'Uploaded File',
      description: `Uploaded "${newFile.name}" (${newFile.size})`,
      targetId: newFile.id,
      targetType: 'file',
    });

    return NextResponse.json(newFile, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/saas/files error:', err);
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 });
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
      return NextResponse.json({ error: 'File id is required' }, { status: 400 });
    }

    // If moving to trash, record timestamp
    if (updates.isTrash === true && updates.trashedAt === undefined) {
      updates.trashedAt = new Date().toISOString();
    } else if (updates.isTrash === false) {
      updates.trashedAt = null;
    }

    const updated = await updateFile(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    let actDesc = `Updated "${updated.name}"`;
    if (updates.name) actDesc = `Renamed to "${updates.name}"`;
    if (updates.folderId !== undefined) actDesc = `Moved "${updated.name}"`;
    if (updates.isTrash === true) actDesc = `Moved "${updated.name}" to Trash`;
    if (updates.isTrash === false) actDesc = `Restored "${updated.name}" from Trash`;

    await logActivity({
      type: 'file_update',
      title: 'File Updated',
      description: actDesc,
      targetId: id,
      targetType: 'file',
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('PATCH /api/saas/files error:', err);
    return NextResponse.json({ error: 'Failed to update file' }, { status: 500 });
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
      const trashed = await getFiles({ isTrash: true });
      for (const f of trashed) {
        await deleteFilePermanently(f.id);
      }
      await logActivity({
        type: 'file_delete',
        title: 'Emptied Trash',
        description: `Permanently deleted ${trashed.length} files from trash`,
        targetType: 'file',
      });
      return NextResponse.json({ success: true, count: trashed.length });
    }

    if (!id) {
      return NextResponse.json({ error: 'File id is required' }, { status: 400 });
    }

    await deleteFilePermanently(id);
    await logActivity({
      type: 'file_delete',
      title: 'Deleted File',
      description: `Permanently deleted file ${id}`,
      targetId: id,
      targetType: 'file',
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('DELETE /api/saas/files error:', err);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}

