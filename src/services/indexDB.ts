/**
 * IndexDB service for Git in Motion.
 * Persists: saved repo sessions, tutorial progress, user preferences.
 */

const DB_NAME = "git-in-motion";
const DB_VERSION = 1;

const STORE_SESSIONS = "saved-sessions";
const STORE_PROGRESS = "tutorial-progress";
const STORE_PREFS = "user-preferences";

export type SavedSession = {
    id: string;
    name: string;
    timestamp: number;
    mode: "basic" | "advanced";
    state: unknown; // serialised RepoState
};

export type TutorialProgressRecord = {
    tutorialId: string;
    currentStepIndex: number;
    completed: boolean;
    completedAt?: number;
};

export type UserPreferences = {
    mode: "basic" | "advanced";
};

// ── DB initialisation ─────────────────────────────────────────────────────────

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
    if (dbInstance) return Promise.resolve(dbInstance);

    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
                db.createObjectStore(STORE_SESSIONS, { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
                db.createObjectStore(STORE_PROGRESS, { keyPath: "tutorialId" });
            }
            if (!db.objectStoreNames.contains(STORE_PREFS)) {
                db.createObjectStore(STORE_PREFS, { keyPath: "key" });
            }
        };

        req.onsuccess = (event) => {
            dbInstance = (event.target as IDBOpenDBRequest).result;
            resolve(dbInstance);
        };

        req.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
}

// ── Generic helpers ───────────────────────────────────────────────────────────

function txGet<T>(db: IDBDatabase, store: string, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => resolve(req.result as T | undefined);
        req.onerror = () => reject(req.error);
    });
}

function txPut(db: IDBDatabase, store: string, value: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        const req = tx.objectStore(store).put(value);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

function txDelete(db: IDBDatabase, store: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        const req = tx.objectStore(store).delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

function txGetAll<T>(db: IDBDatabase, store: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
    });
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function saveSession(
    name: string,
    state: unknown,
    mode: "basic" | "advanced"
): Promise<SavedSession> {
    const db = await openDB();
    const session: SavedSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        timestamp: Date.now(),
        mode,
        state: JSON.parse(JSON.stringify(state)), // deep clone
    };
    await txPut(db, STORE_SESSIONS, session);
    return session;
}

export async function loadSession(id: string): Promise<SavedSession | undefined> {
    const db = await openDB();
    return txGet<SavedSession>(db, STORE_SESSIONS, id);
}

export async function listSessions(): Promise<SavedSession[]> {
    const db = await openDB();
    const all = await txGetAll<SavedSession>(db, STORE_SESSIONS);
    return all.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteSession(id: string): Promise<void> {
    const db = await openDB();
    await txDelete(db, STORE_SESSIONS, id);
}

// ── Tutorial progress ─────────────────────────────────────────────────────────

export async function saveTutorialProgress(
    tutorialId: string,
    stepIndex: number,
    completed: boolean
): Promise<void> {
    const db = await openDB();
    const record: TutorialProgressRecord = {
        tutorialId,
        currentStepIndex: stepIndex,
        completed,
        ...(completed ? { completedAt: Date.now() } : {}),
    };
    await txPut(db, STORE_PROGRESS, record);
}

export async function getTutorialProgress(
    tutorialId: string
): Promise<TutorialProgressRecord | undefined> {
    const db = await openDB();
    return txGet<TutorialProgressRecord>(db, STORE_PROGRESS, tutorialId);
}

export async function getAllTutorialProgress(): Promise<TutorialProgressRecord[]> {
    const db = await openDB();
    return txGetAll<TutorialProgressRecord>(db, STORE_PROGRESS);
}

// ── Preferences ───────────────────────────────────────────────────────────────

export async function savePreferences(prefs: UserPreferences): Promise<void> {
    const db = await openDB();
    await txPut(db, STORE_PREFS, { key: "prefs", ...prefs });
}

export async function getPreferences(): Promise<UserPreferences | null> {
    const db = await openDB();
    const raw = await txGet<{ key: string } & UserPreferences>(db, STORE_PREFS, "prefs");
    if (!raw) return null;
    return { mode: raw.mode };
}
