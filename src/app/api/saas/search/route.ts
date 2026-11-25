import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getFiles, getAllFolders, getNotes } from '@/lib/db-saas';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();

    if (!q) {
      return NextResponse.json({ files: [], folders: [], notes: [], total: 0 });
    }

    const [allFiles, allFolders, allNotes] = await Promise.all([
      getFiles({ isTrash: false }),
      getAllFolders(),
      getNotes({ isTrash: false }),
    ]);

    const matchingFiles = allFiles.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.originalName.toLowerCase().includes(q) ||
        (f.content && f.content.toLowerCase().includes(q)) ||
        f.type.toLowerCase().includes(q) ||
        f.extension.toLowerCase().includes(q)
    );

    const matchingFolders = allFolders.filter((f) => f.name.toLowerCase().includes(q));

    const matchingNotes = allNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );

    return NextResponse.json({
      query: q,
      files: matchingFiles,
      folders: matchingFolders,
      notes: matchingNotes,
      total: matchingFiles.length + matchingFolders.length + matchingNotes.length,
    });
  } catch (err: any) {
    console.error('GET /api/saas/search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

