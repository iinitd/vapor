import { openDB, DBSchema, deleteDB, IDBPDatabase } from 'idb';

interface VaporDB extends DBSchema {
  snippets: {
    key: string;
    value: {
      id: string;
      content: string;
      notepadId?: string;
      createdAt: number;
      updatedAt: number;
    };
    indexes: { 'by-notepad': string };
  };
  snippetOrders: {
    key: string;
    value: {
      id: string;
      notepadId: string;
      snippetIds: string[];
      updatedAt: number;
    };
    indexes: { 'by-notepad': string };
  };
  notepads: {
    key: string;
    value: {
      id: string;
      name: string;
      folderId: string;
      createdAt: number;
      updatedAt: number;
    };
    indexes: { 'by-folder': string };
  };
}

let db: IDBPDatabase<VaporDB>;

export async function initDB() {
  if (!db) {
    const maxRetries = 3;
    const baseDelay = 1000; // 初始延迟1秒

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const dbPromise = openDB<VaporDB>('vapor-db', 3, {
          upgrade(db, oldVersion, newVersion) {
            if (!db.objectStoreNames.contains('snippets')) {
              const snippetStore = db.createObjectStore('snippets', {
                keyPath: 'id'
              });
              snippetStore.createIndex('by-notepad', 'notepadId');
            }

            if (!db.objectStoreNames.contains('snippetOrders')) {
              const snippetOrdersStore = db.createObjectStore('snippetOrders', {
                keyPath: 'id'
              });
              snippetOrdersStore.createIndex('by-notepad', 'notepadId');
            }

            if (!db.objectStoreNames.contains('notepads')) {
              const notepadStore = db.createObjectStore('notepads', {
                keyPath: 'id'
              });
              notepadStore.createIndex('by-folder', 'folderId');
            }
          }
        });

        // 添加超时处理，超时时间随重试次数增加
        const timeout = 5000 * (attempt + 1);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Database connection timeout after ${timeout}ms`)), timeout);
        });

        db = await Promise.race([dbPromise, timeoutPromise]) as IDBPDatabase<VaporDB>;
        console.log('Database initialized successfully');
        return db;
      } catch (error) {
        console.error(`Database initialization attempt ${attempt + 1} failed:`, error);

        if (attempt === maxRetries - 1) {
          // 最后一次重试，尝试删除并重建数据库
          try {
            console.log('Attempting to delete and recreate database...');
            await deleteDB('vapor-db');
            db = await openDB<VaporDB>('vapor-db', 3, {
              upgrade(db) {
                if (!db.objectStoreNames.contains('snippets')) {
                  const snippetStore = db.createObjectStore('snippets', { keyPath: 'id' });
                  snippetStore.createIndex('by-notepad', 'notepadId');
                }
                if (!db.objectStoreNames.contains('snippetOrders')) {
                  const snippetOrdersStore = db.createObjectStore('snippetOrders', { keyPath: 'id' });
                  snippetOrdersStore.createIndex('by-notepad', 'notepadId');
                }
                if (!db.objectStoreNames.contains('notepads')) {
                  const notepadStore = db.createObjectStore('notepads', { keyPath: 'id' });
                  notepadStore.createIndex('by-folder', 'folderId');
                }
              }
            });
            console.log('Database recreated successfully');
            return db;
          } catch (retryError) {
            console.error('Failed to recreate database:', retryError);
            throw new Error('无法初始化数据库，请检查浏览器存储权限或清除浏览器缓存后重试');
          }
        }

        // 使用指数退避策略计算下一次重试的延迟时间
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Waiting ${delay}ms before next retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return db;
}

// Snippet 相关操作
export async function getAllSnippets() {
  const db = await initDB();
  const snippets = await db.getAll('snippets');
  return snippets.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSnippetsByNotepad(notepadId: string) {
  const db = await initDB();
  const snippets = await db.getAllFromIndex('snippets', 'by-notepad', notepadId);
  return snippets.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSnippet(id: string) {
  const db = await initDB();
  return db.get('snippets', id);
}

export async function addSnippet(snippet: Omit<VaporDB['snippets']['value'], 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await initDB();
  const id = crypto.randomUUID();
  const timestamp = Date.now();
  const newSnippet = {
    ...snippet,
    id,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  await db.add('snippets', newSnippet);
  return newSnippet;
}

export async function updateSnippet(id: string, snippet: Partial<Omit<VaporDB['snippets']['value'], 'id' | 'createdAt' | 'updatedAt'>>) {
  const db = await initDB();
  const existingSnippet = await db.get('snippets', id);
  if (!existingSnippet) throw new Error('Snippet not found');
  
  const updatedSnippet = {
    ...existingSnippet,
    ...snippet,
    updatedAt: Date.now()
  };
  await db.put('snippets', updatedSnippet);
  return updatedSnippet;
}

export async function deleteSnippet(id: string) {
  const db = await initDB();
  await db.delete('snippets', id);
}

// Notepad 相关操作
export async function getAllNotepads() {
  const db = await initDB();
  return db.getAll('notepads');
}

export async function getNotepadsByFolder(folderId: string) {
  const db = await initDB();
  return db.getAllFromIndex('notepads', 'by-folder', folderId);
}

export async function getNotepad(id: string) {
  const db = await initDB();
  return db.get('notepads', id);
}

export async function addNotepad(notepad: Omit<VaporDB['notepads']['value'], 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await initDB();
  const id = crypto.randomUUID();
  const timestamp = Date.now();
  const newNotepad = {
    ...notepad,
    id,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  await db.add('notepads', newNotepad);
  return newNotepad;
}

export async function updateNotepad(id: string, notepad: Partial<Omit<VaporDB['notepads']['value'], 'id' | 'createdAt' | 'updatedAt'>>) {
  const db = await initDB();
  const existingNotepad = await db.get('notepads', id);
  if (!existingNotepad) throw new Error('Notepad not found');
  
  const updatedNotepad = {
    ...existingNotepad,
    ...notepad,
    updatedAt: Date.now()
  };
  await db.put('notepads', updatedNotepad);
  return updatedNotepad;
}

export async function deleteNotepad(id: string) {
  const db = await initDB();
  await db.delete('notepads', id);
}

// SnippetOrder 相关操作
export async function getSnippetOrderByNotepad(notepadId: string) {
  const db = await initDB();
  const orders = await db.getAllFromIndex('snippetOrders', 'by-notepad', notepadId);
  return orders[0];
}

export async function addSnippetOrder(notepadId: string, snippetIds: string[]) {
  const db = await initDB();
  const id = crypto.randomUUID();
  const timestamp = Date.now();
  const newOrder = {
    id,
    notepadId,
    snippetIds,
    updatedAt: timestamp
  };
  await db.add('snippetOrders', newOrder);
  return newOrder;
}

export async function updateSnippetOrder(id: string, snippetIds: string[]) {
  const db = await initDB();
  const existingOrder = await db.get('snippetOrders', id);
  if (!existingOrder) throw new Error('SnippetOrder not found');
  
  const updatedOrder = {
    ...existingOrder,
    snippetIds,
    updatedAt: Date.now()
  };
  await db.put('snippetOrders', updatedOrder);
  return updatedOrder;
}

export async function deleteSnippetOrder(id: string) {
  const db = await initDB();
  await db.delete('snippetOrders', id);
}