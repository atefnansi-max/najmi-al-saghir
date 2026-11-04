// Local storage for students and stars. Everything stays on the teacher's device.
const DB_NAME = 'najmi';
const DB_VERSION = 1;
let dbPromise;

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('students')) db.createObjectStore('students', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('stars')) {
          const s = db.createObjectStore('stars', { keyPath: 'id' });
          s.createIndex('studentId', 'studentId');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function tx(store, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const result = fn(s);
    t.oncomplete = () => resolve(result && 'result' in result ? result.result : result);
    t.onerror = () => reject(t.error);
  });
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const getStudents = async () => {
  const list = await tx('students', 'readonly', s => s.getAll());
  return list.sort((a, b) => a.createdAt - b.createdAt);
};
export const getStudent = id => tx('students', 'readonly', s => s.get(id));
export const saveStudent = st => tx('students', 'readwrite', s => s.put(st));
export async function deleteStudent(id) {
  const stars = await getStarsFor(id);
  await tx('stars', 'readwrite', s => stars.forEach(x => s.delete(x.id)));
  return tx('students', 'readwrite', s => s.delete(id));
}

export const getAllStars = () => tx('stars', 'readonly', s => s.getAll());
export const getStarsFor = studentId =>
  tx('stars', 'readonly', s => s.index('studentId').getAll(studentId));
export const saveStar = star => tx('stars', 'readwrite', s => s.put(star));
export const deleteStar = id => tx('stars', 'readwrite', s => s.delete(id));

// Settings are small, so localStorage is enough (wrapped: it can throw in private mode).
const DEFAULT_SETTINGS = { teacher: '', className: 'صف الفراشات', classEmoji: '🦋', kg: '' };
export function getSettings() {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('najmi-settings') || '{}') }; }
  catch { return { ...DEFAULT_SETTINGS }; }
}
export function saveSettings(v) {
  try { localStorage.setItem('najmi-settings', JSON.stringify(v)); } catch { /* ignore */ }
}
