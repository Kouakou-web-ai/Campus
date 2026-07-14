import Dexie, { type Table } from 'dexie';

export interface LocalSession {
  id: string; // The user uid
  token: string;
  expiresAt: number;
  user: any;
}

export interface SyncQueueItem {
  id?: number;
  action: 'set' | 'push' | 'update' | 'remove';
  path: string;
  payload: any;
  timestamp: number;
}

export class CampusDatabase extends Dexie {
  session!: Table<LocalSession>;
  sync_queue!: Table<SyncQueueItem>;
  
  // Local entity tables mirroring university data
  students!: Table<any>;
  teachers!: Table<any>;
  courses!: Table<any>;
  transactions!: Table<any>;
  grades!: Table<any>;
  assignments!: Table<any>;
  resources!: Table<any>;
  scheduleEvents!: Table<any>;
  announcements!: Table<any>;
  emailsSimules!: Table<any>;
  cahierDeTextes!: Table<any>;
  quizzes!: Table<any>;
  appels!: Table<any>; // Can store appels keyed by courseId/day or unique id
  filieres!: Table<any>;
  classes!: Table<any>;
  salles!: Table<any>;
  evaluations!: Table<any>;
  suggestions!: Table<any>;
  gestionnaires!: Table<any>;
  liveMeetings!: Table<any>;
  metadata!: Table<{ key: string; value: any }>;

  constructor() {
    super('CampusDatabase');
    this.version(1).stores({
      session: 'id',
      sync_queue: '++id, timestamp',
      students: 'id, name, filiere, universityId',
      teachers: 'id, name, universityId',
      courses: 'id, title, code, teacherId, universityId',
      transactions: 'id, studentName, status',
      grades: 'id, studentId, courseId',
      assignments: 'id, courseId',
      resources: 'id, courseId',
      scheduleEvents: 'id, date, courseCode',
      announcements: 'id',
      emailsSimules: 'id',
      cahierDeTextes: 'id',
      quizzes: 'id',
      appels: 'id',
      filieres: 'id',
      classes: 'id',
      salles: 'id',
      evaluations: 'id',
      suggestions: 'id',
      gestionnaires: 'id, universityId',
      liveMeetings: 'id',
      metadata: 'key',
    });
  }
}

export const dbLocal = new CampusDatabase();
