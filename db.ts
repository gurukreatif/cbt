/**
 * Emes CBT - Offline Database Manager (IndexedDB)
 */

const DB_VERSION = 2;

export class CBTDatabase {
  private db: IDBDatabase | null = null;
  private dbName: string;

  constructor(schoolId: string) {
    if (!schoolId) {
      throw new Error("School ID is required for tenant-specific database.");
    }
    this.dbName = `emes_cbt_${schoolId}_db`;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve();
      }
      
      const request = indexedDB.open(this.dbName, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('questions')) {
          db.createObjectStore('questions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('answers')) {
          db.createObjectStore('answers', { keyPath: 'questionId' });
        }
        if (!db.objectStoreNames.contains('schedules')) {
          db.createObjectStore('schedules', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('session')) {
          db.createObjectStore('session', { keyPath: 'id' });
        }
      };
    });
  }

  public async perform(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<any> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = action(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveSchedules(schedules: any[]): Promise<void> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction('schedules', 'readwrite');
    const store = transaction.objectStore('schedules');
    store.clear();
    schedules.forEach(s => store.put(s));
    return new Promise((resolve) => transaction.oncomplete = () => resolve());
  }

  async getSchedules(): Promise<any[]> {
    return this.perform('schedules', 'readonly', store => store.getAll());
  }

  async saveQuestions(questions: any[]): Promise<void> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction('questions', 'readwrite');
    const store = transaction.objectStore('questions');
    questions.forEach(q => store.put(q));
    return new Promise((resolve) => transaction.oncomplete = () => resolve());
  }

  async getQuestionsByBankId(bankId: string): Promise<any[]> {
    const all = await this.perform('questions', 'readonly', store => store.getAll());
    return all.filter((q: any) => q.bankId === bankId);
  }

  async clearExamData(): Promise<void> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(['questions', 'answers', 'session', 'schedules'], 'readwrite');
    transaction.objectStore('questions').clear();
    transaction.objectStore('answers').clear();
    transaction.objectStore('session').clear();
    transaction.objectStore('schedules').clear();
    return new Promise((resolve) => transaction.oncomplete = () => resolve());
  }

  async saveAnswer(answer: any): Promise<void> {
    return this.perform('answers', 'readwrite', store => store.put({
      ...answer,
      updatedAt: new Date().toISOString()
    }));
  }

  async getAnswers(): Promise<any[]> {
    return this.perform('answers', 'readonly', store => store.getAll());
  }
}
