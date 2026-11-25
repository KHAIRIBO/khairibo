import { getDb } from './mongodb';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const FILES_FILE = path.join(DATA_DIR, 'files.json');
const FOLDERS_FILE = path.join(DATA_DIR, 'folders.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export interface SaaSFile {
  id: string;
  name: string;
  originalName: string;
  size: string;
  sizeBytes: number;
  type: 'image' | 'document' | 'pdf' | 'video' | 'audio' | 'archive' | 'code' | 'other';
  mimeType: string;
  extension: string;
  url: string;
  content?: string;
  folderId: string | null;
  isFavorite: boolean;
  isTrash: boolean;
  trashedAt: string | null;
  public: boolean;
  allowDownload: boolean;
  shareInPopup: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaaSFolder {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  isFavorite: boolean;
  isTrash: boolean;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaaSNote {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  folderId: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  isTrash: boolean;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaaSActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  targetId?: string;
  targetType?: string;
  timestamp: string;
}

export interface SaaSSettings {
  adminName: string;
  adminEmail: string;
  theme: 'dark' | 'light';
  storageLimitBytes: number;
  autoSaveNotes: boolean;
  notificationsEnabled: boolean;
}

// ── File System Utilities ───────────────────────────────────────────────────
function readJson<T>(filePath: string, defaultVal: T): T {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), 'utf8');
      return defaultVal;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return defaultVal;
  }
}

function writeJson<T>(filePath: string, data: T): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`writeJson failed for ${filePath}:`, err);
  }
}

// ── Activity Logger ─────────────────────────────────────────────────────────
export async function logActivity(act: Omit<SaaSActivity, 'id' | 'timestamp'>): Promise<SaaSActivity> {
  const newActivity: SaaSActivity = {
    id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    ...act,
    timestamp: new Date().toISOString(),
  };

  try {
    const db = await getDb();
    if (db) {
      await db.collection('activities').insertOne({ ...newActivity });
    }
    const local = readJson<SaaSActivity[]>(ACTIVITIES_FILE, []);
    writeJson(ACTIVITIES_FILE, [newActivity, ...local].slice(0, 200));
  } catch (err) {
    console.error('logActivity error:', err);
  }

  return newActivity;
}

export async function getActivities(limit = 30): Promise<SaaSActivity[]> {
  try {
    const db = await getDb();
    if (db) {
      const list = await db.collection('activities').find().sort({ timestamp: -1 }).limit(limit).toArray();
      if (list.length > 0) {
        return list.map((doc) => ({
          id: doc.id || doc._id?.toString(),
          type: doc.type,
          title: doc.title,
          description: doc.description,
          targetId: doc.targetId,
          targetType: doc.targetType,
          timestamp: doc.timestamp || new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.error('getActivities error:', err);
  }

  const local = readJson<SaaSActivity[]>(ACTIVITIES_FILE, []);
  return local.slice(0, limit);
}

// ── File Management ─────────────────────────────────────────────────────────
export function detectFileType(mimeType: string, filename: string): SaaSFile['type'] {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'ico', 'bmp'].includes(ext)) {
    return 'image';
  }
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  if (
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation') ||
    ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'txt', 'rtf', 'csv'].includes(ext)
  ) {
    return 'document';
  }
  if (mimeType.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext)) {
    return 'audio';
  }
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('compressed') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'archive';
  }
  if (
    mimeType.includes('javascript') ||
    mimeType.includes('json') ||
    mimeType.includes('html') ||
    ['js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css', 'py', 'sh', 'sql', 'yaml', 'yml', 'md'].includes(ext)
  ) {
    return 'code';
  }
  return 'other';
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function getFiles(filter?: {
  folderId?: string | null;
  type?: string;
  isFavorite?: boolean;
  isTrash?: boolean;
  search?: string;
}): Promise<SaaSFile[]> {
  try {
    const db = await getDb();
    if (db) {
      const query: Record<string, any> = {};
      if (filter?.isTrash !== undefined) {
        query.isTrash = filter.isTrash;
      } else {
        query.isTrash = { $ne: true };
      }

      if (filter?.folderId !== undefined) {
        query.folderId = filter.folderId;
      }
      if (filter?.type && filter.type !== 'all') {
        query.type = filter.type;
      }
      if (filter?.isFavorite !== undefined) {
        query.isFavorite = filter.isFavorite;
      }

      const list = await db.collection('saas_files').find(query).sort({ createdAt: -1 }).toArray();
      if (list.length > 0) {
        let results = list.map((doc) => ({
          id: doc.id || doc._id?.toString(),
          name: doc.name,
          originalName: doc.originalName || doc.name,
          size: doc.size || '0 KB',
          sizeBytes: doc.sizeBytes || 0,
          type: doc.type || 'other',
          mimeType: doc.mimeType || 'application/octet-stream',
          extension: doc.extension || '',
          url: doc.url || '',
          content: doc.content || '',
          folderId: doc.folderId || null,
          isFavorite: Boolean(doc.isFavorite),
          isTrash: Boolean(doc.isTrash),
          trashedAt: doc.trashedAt || null,
          public: doc.public !== false,
          allowDownload: doc.allowDownload !== false,
          shareInPopup: doc.shareInPopup === true,
          createdAt: doc.createdAt || new Date().toISOString(),
          updatedAt: doc.updatedAt || new Date().toISOString(),
        }));

        if (filter?.search) {
          const s = filter.search.toLowerCase();
          results = results.filter((f) => f.name.toLowerCase().includes(s));
        }

        return results;
      }
    }
  } catch (err) {
    console.error('getFiles MongoDB error, using local fallback:', err);
  }

  // Local JSON fallback
  let files = readJson<SaaSFile[]>(FILES_FILE, []);
  if (filter?.isTrash !== undefined) {
    files = files.filter((f) => Boolean(f.isTrash) === filter.isTrash);
  } else {
    files = files.filter((f) => !f.isTrash);
  }
  if (filter?.folderId !== undefined) {
    files = files.filter((f) => f.folderId === filter.folderId);
  }
  if (filter?.type && filter.type !== 'all') {
    files = files.filter((f) => f.type === filter.type);
  }
  if (filter?.isFavorite !== undefined) {
    files = files.filter((f) => f.isFavorite === filter.isFavorite);
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    files = files.filter((f) => f.name.toLowerCase().includes(s));
  }
  return files;
}

export async function saveFile(file: SaaSFile): Promise<SaaSFile> {
  try {
    const db = await getDb();
    if (db) {
      await db.collection('saas_files').updateOne(
        { id: file.id },
        { $set: file },
        { upsert: true }
      );
    }
    const local = readJson<SaaSFile[]>(FILES_FILE, []);
    const filtered = local.filter((f) => f.id !== file.id);
    writeJson(FILES_FILE, [file, ...filtered]);
  } catch (err) {
    console.error('saveFile error:', err);
  }
  return file;
}

export async function updateFile(id: string, updates: Partial<SaaSFile>): Promise<SaaSFile | null> {
  const fileUpdates = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await getDb();
    if (db) {
      await db.collection('saas_files').updateOne({ id }, { $set: fileUpdates });
    }
  } catch (err) {
    console.error('updateFile db error:', err);
  }

  const local = readJson<SaaSFile[]>(FILES_FILE, []);
  const index = local.findIndex((f) => f.id === id);
  if (index !== -1) {
    local[index] = { ...local[index], ...fileUpdates };
    writeJson(FILES_FILE, local);
    return local[index];
  }

  return null;
}

export async function deleteFilePermanently(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (db) {
      await db.collection('saas_files').deleteOne({ id });
    }
  } catch (err) {
    console.error('deleteFilePermanently db error:', err);
  }

  const local = readJson<SaaSFile[]>(FILES_FILE, []);
  writeJson(FILES_FILE, local.filter((f) => f.id !== id));
  return true;
}

// ── Folder Management ───────────────────────────────────────────────────────
export async function getFolders(parentId: string | null = null, isTrash = false): Promise<SaaSFolder[]> {
  try {
    const db = await getDb();
    if (db) {
      const list = await db.collection('saas_folders').find({ parentId, isTrash }).sort({ name: 1 }).toArray();
      if (list.length > 0) {
        return list.map((d) => ({
          id: d.id || d._id?.toString(),
          name: d.name,
          parentId: d.parentId || null,
          color: d.color || '#b8ff4d',
          isFavorite: Boolean(d.isFavorite),
          isTrash: Boolean(d.isTrash),
          trashedAt: d.trashedAt || null,
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt || new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.error('getFolders db error:', err);
  }

  const local = readJson<SaaSFolder[]>(FOLDERS_FILE, []);
  return local.filter((f) => f.parentId === parentId && Boolean(f.isTrash) === isTrash);
}

export async function getAllFolders(): Promise<SaaSFolder[]> {
  try {
    const db = await getDb();
    if (db) {
      const list = await db.collection('saas_folders').find({ isTrash: { $ne: true } }).toArray();
      if (list.length > 0) {
        return list.map((d) => ({
          id: d.id || d._id?.toString(),
          name: d.name,
          parentId: d.parentId || null,
          color: d.color || '#b8ff4d',
          isFavorite: Boolean(d.isFavorite),
          isTrash: Boolean(d.isTrash),
          trashedAt: d.trashedAt || null,
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt || new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.error('getAllFolders db error:', err);
  }

  const local = readJson<SaaSFolder[]>(FOLDERS_FILE, []);
  return local.filter((f) => !f.isTrash);
}

export async function saveFolder(folder: SaaSFolder): Promise<SaaSFolder> {
  try {
    const db = await getDb();
    if (db) {
      await db.collection('saas_folders').updateOne({ id: folder.id }, { $set: folder }, { upsert: true });
    }
    const local = readJson<SaaSFolder[]>(FOLDERS_FILE, []);
    const filtered = local.filter((f) => f.id !== folder.id);
    writeJson(FOLDERS_FILE, [folder, ...filtered]);
  } catch (err) {
    console.error('saveFolder error:', err);
  }
  return folder;
}

export async function updateFolder(id: string, updates: Partial<SaaSFolder>): Promise<SaaSFolder | null> {
  const folderUpdates = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await getDb();
    if (db) {
      await db.collection('saas_folders').updateOne({ id }, { $set: folderUpdates });
    }
  } catch (err) {
    console.error('updateFolder db error:', err);
  }

  const local = readJson<SaaSFolder[]>(FOLDERS_FILE, []);
  const idx = local.findIndex((f) => f.id === id);
  if (idx !== -1) {
    local[idx] = { ...local[idx], ...folderUpdates };
    writeJson(FOLDERS_FILE, local);
    return local[idx];
  }
  return null;
}

export async function deleteFolderPermanently(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (db) {
      await db.collection('saas_folders').deleteOne({ id });
    }
  } catch (err) {
    console.error('deleteFolderPermanently error:', err);
  }

  const local = readJson<SaaSFolder[]>(FOLDERS_FILE, []);
  writeJson(FOLDERS_FILE, local.filter((f) => f.id !== id));
  return true;
}

// ── Notes Management ────────────────────────────────────────────────────────
export async function getNotes(filter?: {
  folderId?: string | null;
  category?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isTrash?: boolean;
  search?: string;
}): Promise<SaaSNote[]> {
  try {
    const db = await getDb();
    if (db) {
      const query: Record<string, any> = {};
      if (filter?.isTrash !== undefined) {
        query.isTrash = filter.isTrash;
      } else {
        query.isTrash = { $ne: true };
      }

      if (filter?.category && filter.category !== 'All') {
        query.category = filter.category;
      }
      if (filter?.isPinned !== undefined) {
        query.isPinned = filter.isPinned;
      }
      if (filter?.isFavorite !== undefined) {
        query.isFavorite = filter.isFavorite;
      }

      const list = await db.collection('saas_notes').find(query).sort({ isPinned: -1, updatedAt: -1 }).toArray();
      if (list.length > 0) {
        let results = list.map((doc) => ({
          id: doc.id || doc._id?.toString(),
          title: doc.title || 'Untitled Note',
          content: doc.content || '',
          category: doc.category || 'General',
          tags: Array.isArray(doc.tags) ? doc.tags : [],
          folderId: doc.folderId || null,
          isPinned: Boolean(doc.isPinned),
          isFavorite: Boolean(doc.isFavorite),
          isTrash: Boolean(doc.isTrash),
          trashedAt: doc.trashedAt || null,
          createdAt: doc.createdAt || new Date().toISOString(),
          updatedAt: doc.updatedAt || new Date().toISOString(),
        }));

        if (filter?.search) {
          const s = filter.search.toLowerCase();
          results = results.filter(
            (n) => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s) || n.tags.some((t) => t.toLowerCase().includes(s))
          );
        }

        return results;
      }
    }
  } catch (err) {
    console.error('getNotes db error:', err);
  }

  let notes = readJson<SaaSNote[]>(NOTES_FILE, []);
  if (filter?.isTrash !== undefined) {
    notes = notes.filter((n) => Boolean(n.isTrash) === filter.isTrash);
  } else {
    notes = notes.filter((n) => !n.isTrash);
  }
  if (filter?.category && filter.category !== 'All') {
    notes = notes.filter((n) => n.category === filter.category);
  }
  if (filter?.isPinned !== undefined) {
    notes = notes.filter((n) => n.isPinned === filter.isPinned);
  }
  if (filter?.isFavorite !== undefined) {
    notes = notes.filter((n) => n.isFavorite === filter.isFavorite);
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    notes = notes.filter(
      (n) => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s) || n.tags.some((t) => t.toLowerCase().includes(s))
    );
  }

  return notes.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function saveNote(note: SaaSNote): Promise<SaaSNote> {
  try {
    const db = await getDb();
    if (db) {
      await db.collection('saas_notes').updateOne({ id: note.id }, { $set: note }, { upsert: true });
    }
    const local = readJson<SaaSNote[]>(NOTES_FILE, []);
    const filtered = local.filter((n) => n.id !== note.id);
    writeJson(NOTES_FILE, [note, ...filtered]);
  } catch (err) {
    console.error('saveNote error:', err);
  }
  return note;
}

export async function updateNote(id: string, updates: Partial<SaaSNote>): Promise<SaaSNote | null> {
  const noteUpdates = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await getDb();
    if (db) {
      await db.collection('saas_notes').updateOne({ id }, { $set: noteUpdates });
    }
  } catch (err) {
    console.error('updateNote db error:', err);
  }

  const local = readJson<SaaSNote[]>(NOTES_FILE, []);
  const idx = local.findIndex((n) => n.id === id);
  if (idx !== -1) {
    local[idx] = { ...local[idx], ...noteUpdates };
    writeJson(NOTES_FILE, local);
    return local[idx];
  }
  return null;
}

export async function deleteNotePermanently(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (db) {
      await db.collection('saas_notes').deleteOne({ id });
    }
  } catch (err) {
    console.error('deleteNotePermanently db error:', err);
  }

  const local = readJson<SaaSNote[]>(NOTES_FILE, []);
  writeJson(NOTES_FILE, local.filter((n) => n.id !== id));
  return true;
}

// ── Settings ────────────────────────────────────────────────────────────────
const defaultSettings: SaaSSettings = {
  adminName: 'Khairi Bouzakher',
  adminEmail: 'khairibo32@gmail.com',
  theme: 'dark',
  storageLimitBytes: 10 * 1024 * 1024 * 1024, // 10 GB
  autoSaveNotes: true,
  notificationsEnabled: true,
};

export async function getSettings(): Promise<SaaSSettings> {
  try {
    const db = await getDb();
    if (db) {
      const doc = await db.collection('saas_settings').findOne({ id: 'global_settings' });
      if (doc) {
        return {
          adminName: doc.adminName || defaultSettings.adminName,
          adminEmail: doc.adminEmail || defaultSettings.adminEmail,
          theme: doc.theme || defaultSettings.theme,
          storageLimitBytes: doc.storageLimitBytes || defaultSettings.storageLimitBytes,
          autoSaveNotes: doc.autoSaveNotes !== false,
          notificationsEnabled: doc.notificationsEnabled !== false,
        };
      }
    }
  } catch (err) {
    console.error('getSettings db error:', err);
  }

  return readJson<SaaSSettings>(SETTINGS_FILE, defaultSettings);
}

export async function updateSettings(updates: Partial<SaaSSettings>): Promise<SaaSSettings> {
  const current = await getSettings();
  const next = { ...current, ...updates };

  try {
    const db = await getDb();
    if (db) {
      await db.collection('saas_settings').updateOne(
        { id: 'global_settings' },
        { $set: { id: 'global_settings', ...next } },
        { upsert: true }
      );
    }
    writeJson(SETTINGS_FILE, next);
  } catch (err) {
    console.error('updateSettings error:', err);
  }

  return next;
}

// ── Overall Stats & Storage Aggregation ─────────────────────────────────────
export async function getDashboardStats() {
  const [files, folders, notes, activities, settings] = await Promise.all([
    getFiles({ isTrash: false }),
    getAllFolders(),
    getNotes({ isTrash: false }),
    getActivities(10),
    getSettings(),
  ]);

  const totalStorageBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
  const storageLimitBytes = settings.storageLimitBytes;
  const storagePercent = Math.min(100, Math.round((totalStorageBytes / storageLimitBytes) * 100 * 10) / 10);

  // Group by type
  const typeBreakdown = {
    image: files.filter((f) => f.type === 'image').reduce((acc, f) => acc + (f.sizeBytes || 0), 0),
    document: files.filter((f) => f.type === 'document' || f.type === 'pdf').reduce((acc, f) => acc + (f.sizeBytes || 0), 0),
    video: files.filter((f) => f.type === 'video').reduce((acc, f) => acc + (f.sizeBytes || 0), 0),
    audio: files.filter((f) => f.type === 'audio').reduce((acc, f) => acc + (f.sizeBytes || 0), 0),
    code: files.filter((f) => f.type === 'code').reduce((acc, f) => acc + (f.sizeBytes || 0), 0),
    archive: files.filter((f) => f.type === 'archive').reduce((acc, f) => acc + (f.sizeBytes || 0), 0),
    other: files.filter((f) => f.type === 'other').reduce((acc, f) => acc + (f.sizeBytes || 0), 0),
  };

  return {
    totalFiles: files.length,
    totalFolders: folders.length,
    totalNotes: notes.length,
    pinnedNotes: notes.filter((n) => n.isPinned).length,
    totalStorageBytes,
    totalStorageFormatted: formatBytes(totalStorageBytes),
    storageLimitBytes,
    storageLimitFormatted: formatBytes(storageLimitBytes),
    storagePercent,
    typeBreakdown,
    recentFiles: files.slice(0, 6),
    recentNotes: notes.slice(0, 4),
    recentActivities: activities,
  };
}

