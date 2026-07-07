import { create } from 'zustand';
import { useNotificationStore } from './notificationStore';
import { useAuthStore } from './authStore';
import { db, auth, firebaseConfig } from '../../firebase-config';
import { ref, onValue, set, push, update, remove, get, query, orderByChild, equalTo, limitToFirst } from 'firebase/database';
import type { Student, Teacher, Course, Transaction, Grade, Assignment, Resource, ScheduleEvent, University, RevenueData, StatusType, Class, Gestionnaire } from '../types';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { sendRealEmail } from '../services/emailSender';

const FALLBACK_UNIVERSITY_NAME = 'votre établissement';

const isUsableText = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const text = value.trim();
  return text.length > 0 && text.toLowerCase() !== 'undefined' && text.toLowerCase() !== 'null';
};

const getDisplayText = (value: unknown, fallback: string) => (
  isUsableText(value) ? value.trim() : fallback
);

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[char] || char));

async function resolveUniversityName(
  universityId: string,
  state: Pick<RealtimeDataState, 'currentUniversity' | 'universities'>
): Promise<string> {
  const currentName = state.currentUniversity?.id === universityId ? state.currentUniversity.name : undefined;
  const storedName = state.universities.find((u) => u.id === universityId)?.name;
  const localName = getDisplayText(currentName, getDisplayText(storedName, ''));
  if (localName) return localName;

  try {
    const nameSnapshot = await get(ref(db, `universites/${universityId}/branding/name`));
    return getDisplayText(nameSnapshot.val(), FALLBACK_UNIVERSITY_NAME);
  } catch (error) {
    console.error("Erreur lors de la récupération du nom de l'université:", error);
    return FALLBACK_UNIVERSITY_NAME;
  }
}

interface RealtimeDataState {
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
  transactions: Transaction[];
  grades: Grade[];
  assignments: Assignment[];
  resources: Resource[];
  scheduleEvents: ScheduleEvent[];
  universities: University[];
  revenueData: RevenueData[];
  gestionnaires: Gestionnaire[];
  currentUniversity: University | null;
  announcements: any[];
  emailsSimules: any[];
  cahierDeTextes: any[];
  quizzes: any[];
  appels: any;
  loading: boolean;
  filieres: string[];
  classes: Class[];
  salles: string[];
  evaluations: any[];
  suggestions: any[];
  systemAnnouncement: { message: string; type: 'info' | 'warning' | 'error' | 'success'; active: boolean; updatedAt?: string } | null;
  liveMeetings: any[];
  
  startLiveMeeting: (universityId: string, meetingId: string, meetingData: any) => Promise<void>;
  endLiveMeeting: (universityId: string, meetingId: string) => Promise<void>;
  
  subscribeToUniversity: (universityId: string) => () => void;
  subscribeToSuperAdmin: () => () => void;
  
  addStudent: (
    universityId: string,
    student: Omit<Student, 'id' | 'universityId' | 'studentId'> & {
      studentId?: string;
      parentEmail: string;
      parentName: string;
    }
  ) => Promise<{ studentId: string; tempStudentPassword: string; tempParentPassword: string }>;
  updateStudent: (universityId: string, studentId: string, data: Partial<Student>) => Promise<void>;
  addTeacher: (universityId: string, teacher: Omit<Teacher, 'id' | 'universityId'>) => Promise<{ tempTeacherPassword: string; teacherEmail: string; teacherName: string }>;
  updateTeacher: (universityId: string, teacherId: string, data: Partial<Teacher>) => Promise<void>;
  addCourse: (universityId: string, course: Omit<Course, 'id' | 'universityId'>) => Promise<void>;
  updateCourse: (universityId: string, courseId: string, data: Partial<Course>) => Promise<void>;
  addTransaction: (universityId: string, transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addGrade: (universityId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
  updateGrade: (universityId: string, gradeId: string, data: Partial<Grade>) => Promise<void>;
  addAssignment: (universityId: string, assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (universityId: string, assignmentId: string, data: Partial<Assignment>) => Promise<void>;
  addResource: (universityId: string, resource: Omit<Resource, 'id'>) => Promise<void>;
  addScheduleEvent: (universityId: string, event: Omit<ScheduleEvent, 'id'>) => Promise<void>;
  addUniversity: (univ: Omit<University, 'id'>) => Promise<void>;
  addSimulatedEmail: (universityId: string, email: { to: string; recipientName: string; subject: string; body: string; type: string }) => Promise<void>;
  deleteStudent: (universityId: string, studentId: string) => Promise<void>;
  deleteTeacher: (universityId: string, teacherId: string) => Promise<void>;
  deleteCourse: (universityId: string, courseId: string) => Promise<void>;
  deleteTransaction: (universityId: string, transactionId: string) => Promise<void>;
  deleteGrade: (universityId: string, gradeId: string) => Promise<void>;
  deleteAssignment: (universityId: string, assignmentId: string) => Promise<void>;
  deleteResource: (universityId: string, resourceId: string) => Promise<void>;
  deleteScheduleEvent: (universityId: string, eventId: string) => Promise<void>;
  deleteUniversity: (universityId: string) => Promise<void>;
  updateUniversity: (universityId: string, data: Partial<Omit<University, 'id' | 'studentsCount' | 'teachersCount' | 'mrr'>>) => Promise<void>;
  addFiliere: (universityId: string, name: string) => Promise<void>;
  deleteFiliere: (universityId: string, name: string) => Promise<void>;
  addClass: (universityId: string, cls: Omit<Class, 'id'>) => Promise<void>;
  deleteClass: (universityId: string, classId: string) => Promise<void>;
  addSalle: (universityId: string, name: string) => Promise<void>;
  deleteSalle: (universityId: string, name: string) => Promise<void>;
  assignTeacherToCourse: (universityId: string, teacherId: string, teacherName: string, courseId: string) => Promise<void>;
  updateSuggestion: (universityId: string, suggestionId: string, data: Partial<any>) => Promise<void>;
  markAttendance: (
    universityId: string,
    courseId: string,
    attendance: {
      studentId: string;
      studentName: string;
      status: 'present' | 'absent' | 'retard';
      markedAt: string;
    }
  ) => Promise<void>;
  addGestionnaire: (universityId: string, data: { name: string; email: string; role: 'FINANCE_MANAGER' | 'STUDENT_MANAGER' | 'TEACHER_MANAGER' }) => Promise<{ tempPassword: string }>;
  updateGestionnaire: (universityId: string, uid: string, data: Partial<Gestionnaire>) => Promise<void>;
  deleteGestionnaire: (universityId: string, uid: string) => Promise<void>;
}

export const useRealtimeDataStore = create<RealtimeDataState>((setStore, getStore) => ({
  students: [],
  teachers: [],
  courses: [],
  transactions: [],
  grades: [],
  assignments: [],
  resources: [],
  scheduleEvents: [],
  universities: [],
  revenueData: [],
  currentUniversity: null,
  announcements: [],
  emailsSimules: [],
  cahierDeTextes: [],
  quizzes: [],
  appels: {},
  loading: false,
  filieres: [],
  classes: [],
  salles: [],
  evaluations: [],
  suggestions: [],
  gestionnaires: [],
  systemAnnouncement: null,
  liveMeetings: [],

  subscribeToUniversity: (universityId: string) => {
    setStore({ loading: true });

    const parseList = (node: any) => {
      if (!node) return [];
      return Object.keys(node).map(key => ({ id: key, ...node[key] }));
    };

    const unsubscribers: (() => void)[] = [];
    
    // Variables locales pour construire l'état agrégé currentUniversity
    let branding: any = {};
    let plan: 'starter' | 'pro' | 'enterprise' = 'pro';
    let status: StatusType = 'actif';
    let createdAt = new Date().toISOString().split('T')[0];
    let adminUid: string | undefined = undefined;
    let adminName: string | undefined = undefined;
    let adminEmail: string | undefined = undefined;
    let studentsCount = 0;
    let teachersCount = 0;

    const updateCurrentUniversity = () => {
      let mrrVal = 0;
      if (plan === 'enterprise') mrrVal = 250000;
      else if (plan === 'pro') mrrVal = 100000;
      else mrrVal = 50000;

      setStore({
        currentUniversity: {
          id: universityId,
          name: branding?.name || 'CAMPUS Établissement',
          city: branding?.city || 'Abidjan',
          country: branding?.country || "Côte d'Ivoire",
          plan,
          status,
          studentsCount,
          teachersCount,
          mrr: mrrVal,
          createdAt,
          adminUid,
          adminName,
          adminEmail
        }
      });
    };

    // 1-7. Metadata (lightweight & always loaded)
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/branding`), (snap) => {
      branding = snap.val() || {};
      updateCurrentUniversity();
    }));
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/plan`), (snap) => {
      plan = snap.val() || 'pro';
      updateCurrentUniversity();
    }));
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/status`), (snap) => {
      status = snap.val() || 'actif';
      updateCurrentUniversity();
    }));
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/createdAt`), (snap) => {
      createdAt = snap.val() || new Date().toISOString().split('T')[0];
      updateCurrentUniversity();
    }));
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/adminUid`), (snap) => {
      adminUid = snap.val() || undefined;
      updateCurrentUniversity();
    }));
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/adminName`), (snap) => {
      adminName = snap.val() || undefined;
      updateCurrentUniversity();
    }));
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/adminEmail`), (snap) => {
      adminEmail = snap.val() || undefined;
      updateCurrentUniversity();
    }));

    // Annonces Globales (always loaded)
    unsubscribers.push(onValue(ref(db, 'annonces_globales'), (snap) => {
      setStore({ systemAnnouncement: snap.val() || null });
    }));

    // Get current user role and UID to conditionally subscribe (Lazy & Tenant-isolated)
    const currentUser = useAuthStore.getState().user;
    const userRole = currentUser?.role as string | undefined;
    const userUid = currentUser?.id || '';

    if (userRole === 'STUDENT') {
      // STUDENT ROLE OPTIMIZATIONS
      // Listen to own student profile only
      unsubscribers.push(onValue(ref(db, `universites/${universityId}/etudiants/${userUid}`), (snap) => {
        const studentVal = snap.val();
        if (studentVal) {
          setStore({ students: [{ id: userUid, ...studentVal }] });
        } else {
          setStore({ students: [] });
        }
      }));

      // Query own notes
      const notesQuery = query(ref(db, `universites/${universityId}/notes`), orderByChild('studentId'), equalTo(userUid));
      unsubscribers.push(onValue(notesQuery, (notesSnap) => {
        setStore({ grades: parseList(notesSnap.val()) });
      }));

      // Query own transactions (filtered by studentName to match UI structure)
      const studentName = currentUser?.name || '';
      const transQuery = query(ref(db, `universites/${universityId}/transactions`), orderByChild('studentName'), equalTo(studentName));
      unsubscribers.push(onValue(transQuery, (transSnap) => {
        setStore({ transactions: parseList(transSnap.val()) });
      }));

    } else if (userRole === 'PARENT') {
      // PARENT ROLE OPTIMIZATIONS
      // Listen to linked children profiles, notes and transactions
      const enfantsRef = ref(db, `utilisateurs/${userUid}/enfants`);
      unsubscribers.push(onValue(enfantsRef, (enfantsSnap) => {
        const enfantsVal = enfantsSnap.val() || {};
        const childUids = Object.keys(enfantsVal);

        setStore({ students: [], grades: [], transactions: [] });

        childUids.forEach((childUid) => {
          // Listen to child profile
          const studentRef = ref(db, `universites/${universityId}/etudiants/${childUid}`);
          unsubscribers.push(onValue(studentRef, (studentSnap) => {
            if (studentSnap.exists()) {
              const childProfile = studentSnap.val();
              const childName = childProfile?.name || '';
              
              setStore((state) => {
                const filtered = state.students.filter(s => s.id !== childUid);
                return { students: [...filtered, { id: childUid, ...childProfile }] };
              });

              // Query transactions for child (filtered by studentName)
              const transQuery = query(ref(db, `universites/${universityId}/transactions`), orderByChild('studentName'), equalTo(childName));
              unsubscribers.push(onValue(transQuery, (transSnap) => {
                const list = parseList(transSnap.val());
                setStore((state) => {
                  const filtered = state.transactions.filter(t => t.studentName !== childName);
                  return { transactions: [...filtered, ...list] };
                });
              }));
            }
          }));

          // Query notes for child
          const notesQuery = query(ref(db, `universites/${universityId}/notes`), orderByChild('studentId'), equalTo(childUid));
          unsubscribers.push(onValue(notesQuery, (notesSnap) => {
            const list = parseList(notesSnap.val());
            setStore((state) => {
              const filtered = state.grades.filter(g => g.studentId !== childUid);
              return { grades: [...filtered, ...list] };
            });
          }));
        });
      }));

    } else if (userRole === 'TEACHER') {
      // TEACHER ROLE OPTIMIZATIONS
      // Listen to own teacher profile
      unsubscribers.push(onValue(ref(db, `universites/${universityId}/enseignants/${userUid}`), (snap) => {
        const teacherVal = snap.val();
        if (teacherVal) {
          setStore({ teachers: [{ id: userUid, ...teacherVal }] });
        } else {
          setStore({ teachers: [] });
        }
      }));

      // Query notes for the teacher's grading duties
      const notesQuery = query(ref(db, `universites/${universityId}/notes`), orderByChild('teacherId'), equalTo(userUid));
      unsubscribers.push(onValue(notesQuery, (notesSnap) => {
        setStore({ grades: parseList(notesSnap.val()) });
      }));

      // Query only courses taught by this teacher
      const coursesQuery = query(ref(db, `universites/${universityId}/cours`), orderByChild('teacherId'), equalTo(userUid));
      unsubscribers.push(onValue(coursesQuery, (coursesSnap) => {
        const teacherCourses = parseList(coursesSnap.val());
        setStore({ courses: teacherCourses });

        // Retrieve and subscribe to students belonging to the unique filieres taught by this teacher
        const uniqueFilieres = Array.from(new Set(teacherCourses.map(c => c.filiere).filter(Boolean)));
        uniqueFilieres.forEach((filiere) => {
          const filiereStr = String(filiere || '');
          if (!filiereStr) return;
          
          const studentQuery = query(ref(db, `universites/${universityId}/etudiants`), orderByChild('filiere'), equalTo(filiereStr));
          unsubscribers.push(onValue(studentQuery, (studentSnap) => {
            const list = parseList(studentSnap.val());
            setStore((state) => {
              // Merge students from other filieres
              const otherStudents = state.students.filter(s => s.filiere !== filiereStr);
              return { students: [...otherStudents, ...list] };
            });
          }));
        });
      }));

    } else {
      // ADMIN & MANAGER ROLES (Full sync with safety checks)
      // Listen to students
      unsubscribers.push(onValue(ref(db, `universites/${universityId}/etudiants`), (snap) => {
        const list = parseList(snap.val());
        studentsCount = list.length;
        setStore({ students: list });
        updateCurrentUniversity();
      }));

      // Listen to teachers
      unsubscribers.push(onValue(ref(db, `universites/${universityId}/enseignants`), (snap) => {
        const list = parseList(snap.val());
        teachersCount = list.length;
        setStore({ teachers: list });
        updateCurrentUniversity();
      }));

      // Listen to all courses
      unsubscribers.push(onValue(ref(db, `universites/${universityId}/cours`), (snap) => {
        setStore({ courses: parseList(snap.val()) });
      }));

      // Listen to transactions
      unsubscribers.push(onValue(ref(db, `universites/${universityId}/transactions`), (snap) => {
        setStore({ transactions: parseList(snap.val()) });
      }));

      // Listen to notes
      unsubscribers.push(onValue(ref(db, `universites/${universityId}/notes`), (snap) => {
        setStore({ grades: parseList(snap.val()) });
      }));

      // Listen to gestionnaires (admins and student managers only)
      unsubscribers.push(onValue(ref(db, `universites/${universityId}/gestionnaires`), (snap) => {
        setStore({ gestionnaires: parseList(snap.val()) });
      }));

      // Listen to evaluations
      let isInitialEvals = true;
      unsubscribers.push(onValue(ref(db, `universites/${universityId}/evaluations`), (snap) => {
        const data = snap.val();
        const list = parseList(data);
        list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
        setStore({ evaluations: list });

        if (isInitialEvals) {
          isInitialEvals = false;
          return;
        }
        if (data && (userRole === 'UNIVERSITY_ADMIN' || userRole === 'ADMIN')) {
          const newest = list[0];
          if (newest) {
            const elapsed = Date.now() - new Date(newest.submittedAt).getTime();
            if (elapsed < 10000) {
              useNotificationStore.getState().addNotification(
                `⭐ Nouvelle note — Évaluation`,
                `${newest.userName} (${newest.userRole === 'PARENT' ? 'Parent' : 'Étudiant'}) a attribué ${newest.average}/5.`,
                'success',
                {
                  type: 'evaluation',
                  userName: newest.userName,
                  userRole: newest.userRole,
                  ratings: newest.ratings,
                  average: newest.average,
                  comment: newest.comment,
                  submittedAt: newest.submittedAt
                }
              );
            }
          }
        }
      }));

      // Listen to suggestions
      let isInitialSuggs = true;
      unsubscribers.push(onValue(ref(db, `universites/${universityId}/suggestions`), (snap) => {
        const data = snap.val();
        const list = parseList(data);
        list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
        setStore({ suggestions: list });

        if (isInitialSuggs) {
          isInitialSuggs = false;
          return;
        }
        if (data && (userRole === 'UNIVERSITY_ADMIN' || userRole === 'ADMIN')) {
          const newest = list[0];
          if (newest) {
            const elapsed = Date.now() - new Date(newest.submittedAt).getTime();
            if (elapsed < 10000) {
              useNotificationStore.getState().addNotification(
                `💡 Nouvelle suggestion`,
                `${newest.userName} (${newest.userRole === 'PARENT' ? 'Parent' : 'Étudiant'}) : ${newest.subject}`,
                'info',
                {
                  type: 'suggestion',
                  userName: newest.userName,
                  userRole: newest.userRole,
                  category: newest.category,
                  subject: newest.subject,
                  content: newest.content,
                  submittedAt: newest.submittedAt
                }
              );
            }
          }
        }
      }));
    }

    // SHARED / PEDAGOGICAL RESOURCES (Subscribed by all roles in that university)
    // Devoirs
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/devoirs`), (snap) => {
      setStore({ assignments: parseList(snap.val()) });
    }));

    // Ressources
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/ressources`), (snap) => {
      setStore({ resources: parseList(snap.val()) });
    }));

    // Emploi du temps
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/emploi_du_temps`), (snap) => {
      setStore({ scheduleEvents: parseList(snap.val()) });
    }));

    // Annonces
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/annonces`), (snap) => {
      setStore({ announcements: parseList(snap.val()) });
    }));

    // Emails simulés
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/emails_simules`), (snap) => {
      setStore({ emailsSimules: parseList(snap.val()) });
    }));

    // Cahier de textes
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/cahier_de_textes`), (snap) => {
      setStore({ cahierDeTextes: parseList(snap.val()) });
    }));

    // Quizzes
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/quizzes`), (snap) => {
      setStore({ quizzes: parseList(snap.val()) });
    }));

    // Appels (Absences)
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/appels`), (snap) => {
      setStore({ appels: snap.val() || {} });
    }));

    // Filières
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/filieres`), (snap) => {
      const val = snap.val();
      setStore({ filieres: val ? Object.values(val) : [] });
    }));

    // Classes
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/classes`), (snap) => {
      const val = snap.val();
      setStore({ classes: val ? Object.keys(val).map(key => ({ id: key, ...val[key] })) : [], loading: false });
    }));

    // Salles
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/salles`), (snap) => {
      const val = snap.val();
      setStore({ salles: val ? Object.values(val) : [] });
    }));

    // Cours en ligne / Visioconférence
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/cours_en_ligne`), (snap) => {
      const meetings = parseList(snap.val());
      const now = new Date().getTime();
      const validMeetings = meetings.filter(m => {
        if (!m.createdAt) {
          const staleMeetingRef = ref(db, `universites/${universityId}/cours_en_ligne/${m.id}`);
          remove(staleMeetingRef).catch(() => {});
          return false;
        }
        const createdTime = new Date(m.createdAt).getTime();
        if (now - createdTime > 7200000) { // 2 heures
          const staleMeetingRef = ref(db, `universites/${universityId}/cours_en_ligne/${m.id}`);
          remove(staleMeetingRef).catch(() => {});
          return false;
        }
        return true;
      });
      setStore({ liveMeetings: validMeetings });
    }));

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  },

  subscribeToSuperAdmin: () => {
    setStore({ loading: true });
    
    // Subscribe to all universities
    const univsRef = ref(db, 'universites');
    const unsubscribeUnivs = onValue(univsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list: University[] = [];
      let totalStudents = 0;
      let totalTeachers = 0;
      let totalMRR = 0;

      const allEmails: any[] = [];
      Object.keys(data).forEach(key => {
        const u = data[key];
        const studentsCount = u.etudiants ? Object.keys(u.etudiants).length : 0;
        const teachersCount = u.enseignants ? Object.keys(u.enseignants).length : 0;
        const coursCount = u.cours ? Object.keys(u.cours).length : 0;
        const devoirsCount = u.devoirs ? Object.keys(u.devoirs).length : 0;
        const ressourcesCount = u.ressources ? Object.keys(u.ressources).length : 0;
        const transactionsCount = u.transactions ? Object.keys(u.transactions).length : 0;
        
        // Calculate dynamic MRR based on plans or payments
        let mrrVal = 0;
        if (u.plan === 'enterprise') mrrVal = 250000;
        else if (u.plan === 'pro') mrrVal = 100000;
        else mrrVal = 50000;

        totalStudents += studentsCount;
        totalTeachers += teachersCount;
        totalMRR += mrrVal;

        list.push({
          id: key,
          name: u.branding?.name || key,
          city: u.branding?.city || 'Abidjan',
          country: u.branding?.country || "Côte d'Ivoire",
          plan: u.plan || 'pro',
          status: u.status || 'actif',
          studentsCount,
          teachersCount,
          mrr: mrrVal,
          createdAt: u.createdAt || new Date().toISOString().split('T')[0],
          adminUid: u.adminUid || undefined,
          adminName: u.adminName || undefined,
          adminEmail: u.adminEmail || undefined,
          coursCount,
          devoirsCount,
          ressourcesCount,
          transactionsCount,
        });

        if (u.emails_simules) {
          Object.keys(u.emails_simules).forEach(emailId => {
            allEmails.push({
              id: emailId,
              universityId: key,
              universityName: u.branding?.name || key,
              ...u.emails_simules[emailId]
            });
          });
        }
      });

      // Construct dynamic revenue data based on current MRR starting from the earliest university creation date
      const getMonthsList = () => {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const now = new Date();
        
        // Find earliest creation date
        const earliestDateStr = list.reduce((earliest, u) => {
          if (!u.createdAt) return earliest;
          return new Date(u.createdAt) < new Date(earliest) ? u.createdAt : earliest;
        }, now.toISOString().split('T')[0]);

        const start = new Date(earliestDateStr);
        const current = new Date(start.getFullYear(), start.getMonth(), 1);
        const result = [];
        
        while (current <= now) {
          result.push({
            date: new Date(current),
            monthStr: months[current.getMonth()],
            year: current.getFullYear()
          });
          current.setMonth(current.getMonth() + 1);
        }

        if (result.length === 0) {
          result.push({
            date: new Date(now.getFullYear(), now.getMonth(), 1),
            monthStr: months[now.getMonth()],
            year: now.getFullYear()
          });
        }
        return result;
      };

      const monthsList = getMonthsList();
      const currentRevenueData: RevenueData[] = monthsList.map(({ date, monthStr }) => {
        // Find universities that were created before or during this month
        const activeInMonth = list.filter(u => {
          if (!u.createdAt) return false;
          const uDate = new Date(u.createdAt);
          const uYear = uDate.getFullYear();
          const uMonth = uDate.getMonth();
          const targetYear = date.getFullYear();
          const targetMonth = date.getMonth();
          return (uYear < targetYear) || (uYear === targetYear && uMonth <= targetMonth);
        });

        const rev = activeInMonth.reduce((sum, u) => sum + u.mrr, 0);
        return {
          month: monthStr,
          revenus: rev,
          objectif: Math.round(rev * 1.1),
          clients: activeInMonth.length
        };
      });

      setStore({
        universities: list,
        revenueData: currentRevenueData,
        emailsSimules: allEmails,
        loading: false
      });
    }, (error) => {
      console.error(error);
      setStore({ loading: false });
    });

    // Subscribe to global announcements
    const announcementRef = ref(db, 'annonces_globales');
    const unsubscribeAnnouncement = onValue(announcementRef, (snap) => {
      setStore({ systemAnnouncement: snap.val() || null });
    });

    return () => {
      unsubscribeUnivs();
      unsubscribeAnnouncement();
    };
  },

  addStudent: async (universityId, studentData) => {
    const { parentEmail, parentName, studentId: customStudentId, ...studentInfo } = studentData;

    if (studentInfo.email.trim().toLowerCase() === parentEmail.trim().toLowerCase()) {
      throw new Error("L'email de l'étudiant et du parent doivent être différents.");
    }

    // 1. Générer le matricule étudiant si non renseigné
    const studentId = customStudentId?.trim() || `ETU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Générer des mots de passe temporaires
    const tempStudentPassword = 'ETU-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const tempParentPassword = 'PAR-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const universityName = await resolveUniversityName(universityId, getStore());

    // 3. Enregistrer l'étudiant dans Firebase Auth (via une app secondaire)
    let studentUid = '';
    const tempStudentAppName = `temp-student-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tempStudentApp = initializeApp(firebaseConfig, tempStudentAppName);
    const tempStudentAuth = getAuth(tempStudentApp);
    try {
      const studentCreds = await createUserWithEmailAndPassword(tempStudentAuth, studentInfo.email.trim(), tempStudentPassword);
      studentUid = studentCreds.user.uid;
    } catch (err: any) {
      await deleteApp(tempStudentApp);
      if (err.code === 'auth/email-already-in-use') {
        throw new Error("L'adresse email de l'étudiant est déjà utilisée.");
      }
      throw err;
    }
    await deleteApp(tempStudentApp);

    // 4. Vérifier si le parent existe déjà dans /utilisateurs (Requête optimisée O(1))
    let parentUid = '';
    const usersRef = ref(db, 'utilisateurs');
    const parentQuery = query(usersRef, orderByChild('email'), equalTo(parentEmail.trim().toLowerCase()), limitToFirst(1));
    const parentQuerySnap = await get(parentQuery);
    if (parentQuerySnap.exists()) {
      const parentVal = parentQuerySnap.val();
      const parentEntry = Object.entries(parentVal).find(
        ([_, u]: [string, any]) => u && u.role === 'PARENT'
      );
      if (parentEntry) {
        parentUid = parentEntry[0];
      }
    }

    // 5. Si le parent n'existe pas, le créer dans Firebase Auth
    if (!parentUid) {
      const tempParentAppName = `temp-parent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const tempParentApp = initializeApp(firebaseConfig, tempParentAppName);
      const tempParentAuth = getAuth(tempParentApp);
      try {
        const parentCreds = await createUserWithEmailAndPassword(tempParentAuth, parentEmail.trim(), tempParentPassword);
        parentUid = parentCreds.user.uid;
      } catch (err: any) {
        await deleteApp(tempParentApp);
        if (err.code === 'auth/email-already-in-use') {
          throw new Error("L'adresse email du parent est déjà utilisée pour un autre type de compte.");
        }
        throw err;
      }
      await deleteApp(tempParentApp);
    }

    // 6. Enregistrer l'étudiant dans la liste de l'université (parentUid inclus pour O(1) delete)
    const studentUnivRef = ref(db, `universites/${universityId}/etudiants/${studentUid}`);
    await set(studentUnivRef, {
      ...studentInfo,
      id: studentUid,
      studentId,
      universityId,
      parentUid,
      status: 'actif',
      createdAt: new Date().toISOString()
    });

    // 7. Enregistrer le profil étudiant dans /utilisateurs (parentUid inclus pour O(1) delete)
    const studentUserRef = ref(db, `utilisateurs/${studentUid}`);
    const sPrenom = (studentInfo as any).prenom || studentInfo.name.split(' ')[0] || '';
    const sNom = (studentInfo as any).nom || studentInfo.name.split(' ').slice(1).join(' ') || studentInfo.name;
    await set(studentUserRef, {
      uid: studentUid,
      email: studentInfo.email.trim(),
      role: 'STUDENT',
      status: 'active',
      universityId,
      parentUid,
      prenom: sPrenom,
      nom: sNom,
      telephone: '',
      adresse: '',
      createdDate: new Date().toISOString(),
      mustChangePassword: true,
      tempPassword: tempStudentPassword
    });

    // 8. Enregistrer le profil parent dans /utilisateurs (fusionner les enfants s'il existe)
    const parentUserRef = ref(db, `utilisateurs/${parentUid}`);
    const pPrenom = parentName.split(' ')[0] || '';
    const pNom = parentName.split(' ').slice(1).join(' ') || parentName;
    
    const parentSnap = await get(parentUserRef);
    let parentChildren = {};
    if (parentSnap.exists()) {
      parentChildren = parentSnap.val().enfants || {};
    }
    const updatedChildren = { ...parentChildren, [studentUid]: true };

    await set(parentUserRef, {
      uid: parentUid,
      email: parentEmail.trim(),
      role: 'PARENT',
      status: 'active',
      universityId,
      prenom: pPrenom,
      nom: pNom,
      telephone: parentSnap.exists() ? (parentSnap.val().telephone || '') : '',
      adresse: parentSnap.exists() ? (parentSnap.val().adresse || '') : '',
      createdDate: parentSnap.exists() ? (parentSnap.val().createdDate || new Date().toISOString()) : new Date().toISOString(),
      mustChangePassword: parentSnap.exists() ? (parentSnap.val().mustChangePassword ?? true) : true,
      tempPassword: parentSnap.exists() ? (parentSnap.val().tempPassword || tempParentPassword) : tempParentPassword,
      enfants: updatedChildren
    });

    // 9. Envoyer les e-mails de bienvenue simulés
    const emailsRef = ref(db, `universites/${universityId}/emails_simules`);
    
    // E-mail étudiant
    const studentEmailRef = push(emailsRef);
    await set(studentEmailRef, {
      to: studentInfo.email.trim(),
      recipientName: studentInfo.name,
      subject: "Bienvenue sur CAMPUS - Vos accès Étudiant",
      body: `Bonjour ${studentInfo.name},\n\nVotre compte étudiant à ${universityName} sur la plateforme CAMPUS a été créé avec succès par l'administration.\n\nVoici vos identifiants temporaires de connexion :\n- Email : ${studentInfo.email.trim()}\n- Matricule : ${studentId}\n- Mot de passe temporaire : ${tempStudentPassword}\n\nLors de votre première connexion, vous devrez obligatoirement changer ce mot de passe temporaire.\n\nCordialement,\nL'administration académique`,
      universityName,
      sentAt: new Date().toISOString(),
      type: 'welcome'
    });

    // E-mail parent
    const parentEmailRef = push(emailsRef);
    await set(parentEmailRef, {
      to: parentEmail.trim(),
      recipientName: parentName,
      subject: "Bienvenue sur CAMPUS - Vos accès Parent",
      body: `Bonjour ${parentName},\n\nVotre compte parent à ${universityName} pour le suivi de l'étudiant(e) ${studentInfo.name} (Matricule : ${studentId}) a été créé automatiquement sur la plateforme CAMPUS.\n\nVoici vos identifiants temporaires de connexion :\n- Email : ${parentEmail.trim()}\n- Matricule de l'enfant : ${studentId}\n- Mot de passe temporaire : ${tempParentPassword}\n\nLors de votre première connexion, vous devrez obligatoirement changer ce mot de passe temporaire.\n\nCordialement,\nL'administration académique`,
      universityName,
      sentAt: new Date().toISOString(),
      type: 'welcome'
    });

    // Envoi des e-mails réels via Nodemailer
    const loginUrl = `${window.location.origin}/connexion`;
    const safeStudentName = escapeHtml(getDisplayText(studentInfo.name, 'Étudiant'));
    const safeStudentEmail = escapeHtml(studentInfo.email.trim());
    const safeParentName = escapeHtml(getDisplayText(parentName, 'Parent'));
    const safeParentEmail = escapeHtml(parentEmail.trim());
    const safeStudentId = escapeHtml(studentId);
    const safeUniversityName = escapeHtml(universityName);
    const safeLoginUrl = escapeHtml(loginUrl);
    const safeStudentPassword = escapeHtml(tempStudentPassword);
    const safeParentPassword = escapeHtml(tempParentPassword);
    
    // E-mail réel Étudiant
    await sendRealEmail(
      studentInfo.email.trim(),
      "Bienvenue sur CAMPUS - Vos accès Étudiant",
      `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
         <h2 style="color: #4f46e5;">Bienvenue sur CAMPUS !</h2>
         <p>Bonjour <strong>${safeStudentName}</strong>,</p>
         <p>Votre compte étudiant à <strong>${safeUniversityName}</strong> sur la plateforme CAMPUS a été créé avec succès par l'administration.</p>
         <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 16px 0; border: 1px solid #cbd5e1;">
           <h3 style="margin-top: 0; color: #334155; font-size: 14px;">Vos identifiants temporaires de connexion :</h3>
           <p style="margin: 6px 0; font-size: 13px;"><strong>Email :</strong> ${safeStudentEmail}</p>
           <p style="margin: 6px 0; font-size: 13px;"><strong>Matricule :</strong> ${safeStudentId}</p>
           <p style="margin: 6px 0; font-size: 13px;"><strong>Mot de passe provisoire :</strong> <span style="font-family: monospace; font-size: 14px; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #0f172a;">${safeStudentPassword}</span></p>
         </div>
         <p style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; color: #78350f; font-size: 12px; border-radius: 4px;">
           <strong>Important :</strong> Lors de votre première connexion, vous devrez obligatoirement modifier ce mot de passe temporaire pour sécuriser votre compte.
         </p>
         <p style="margin: 24px 0; text-align: center;">
           <a href="${safeLoginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Se connecter à CAMPUS</a>
         </p>
         <p style="color: #64748b; font-size: 12px;">Si le bouton ne fonctionne pas, copiez-collez ce lien : <br/> <a href="${safeLoginUrl}">${safeLoginUrl}</a></p>
         <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
         <p style="color: #64748b; font-size: 11px;">L'administration académique</p>
       </div>`
    );

    // E-mail réel Parent
    await sendRealEmail(
      parentEmail.trim(),
      "Bienvenue sur CAMPUS - Vos accès Parent",
      `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
         <h2 style="color: #4f46e5;">Suivi Parent - Bienvenue sur CAMPUS !</h2>
         <p>Bonjour <strong>${safeParentName}</strong>,</p>
         <p>Votre compte parent à <strong>${safeUniversityName}</strong> pour le suivi de la scolarité de <strong>${safeStudentName}</strong> a été créé automatiquement sur la plateforme CAMPUS.</p>
         <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 16px 0; border: 1px solid #cbd5e1;">
           <h3 style="margin-top: 0; color: #334155; font-size: 14px;">Vos identifiants temporaires de connexion :</h3>
           <p style="margin: 6px 0; font-size: 13px;"><strong>Email :</strong> ${safeParentEmail}</p>
           <p style="margin: 6px 0; font-size: 13px;"><strong>Matricule de l'enfant :</strong> ${safeStudentId}</p>
           <p style="margin: 6px 0; font-size: 13px;"><strong>Mot de passe provisoire :</strong> <span style="font-family: monospace; font-size: 14px; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #0f172a;">${safeParentPassword}</span></p>
         </div>
         <p style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; color: #78350f; font-size: 12px; border-radius: 4px;">
           <strong>Important :</strong> Lors de votre première connexion, vous devrez obligatoirement modifier ce mot de passe temporaire pour sécuriser votre compte.
         </p>
         <p style="margin: 24px 0; text-align: center;">
           <a href="${safeLoginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Se connecter à CAMPUS</a>
         </p>
         <p style="color: #64748b; font-size: 12px;">Si le bouton ne fonctionne pas, copiez-collez ce lien : <br/> <a href="${safeLoginUrl}">${safeLoginUrl}</a></p>
         <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
         <p style="color: #64748b; font-size: 11px;">L'administration académique</p>
       </div>`
    );

    return {
      studentId,
      tempStudentPassword,
      tempParentPassword
    };
  },

  updateStudent: async (universityId, studentId, data) => {
    const studentRef = ref(db, `universites/${universityId}/etudiants/${studentId}`);
    await update(studentRef, data);
  },

  addTeacher: async (universityId, teacher) => {
    // 1. Generate temp teacher password
    const tempTeacherPassword = 'ENS-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // 2. Create in Firebase Auth using a secondary app
    let teacherUid = '';
    const tempAppName = `temp-teacher-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);
    try {
      const creds = await createUserWithEmailAndPassword(tempAuth, teacher.email.trim(), tempTeacherPassword);
      teacherUid = creds.user.uid;
    } catch (err: any) {
      await deleteApp(tempApp);
      if (err.code === 'auth/email-already-in-use') {
        throw new Error("L'adresse email de l'enseignant est déjà utilisée.");
      }
      throw err;
    }
    await deleteApp(tempApp);

    // 3. Enregistrer l'enseignant dans l'université
    const teacherRef = ref(db, `universites/${universityId}/enseignants/${teacherUid}`);
    await set(teacherRef, {
      ...teacher,
      id: teacherUid,
      universityId,
      status: 'actif',
      createdAt: new Date().toISOString()
    });

    // 4. Create teacher profile in /utilisateurs
    const userRef = ref(db, `utilisateurs/${teacherUid}`);
    const prenom = teacher.name.split(' ')[0] || '';
    const nom = teacher.name.split(' ').slice(1).join(' ') || teacher.name;

    await set(userRef, {
      uid: teacherUid,
      email: teacher.email.trim(),
      role: 'TEACHER',
      status: 'active',
      universityId,
      prenom,
      nom,
      telephone: '',
      adresse: '',
      createdDate: new Date().toISOString(),
      mustChangePassword: true,
      tempPassword: tempTeacherPassword
    });

    // 5. Send welcome email with temp password
    const emailsRef = ref(db, `universites/${universityId}/emails_simules`);
    const newEmailRef = push(emailsRef);
    await set(newEmailRef, {
      to: teacher.email.trim(),
      recipientName: teacher.name,
      subject: "Bienvenue sur CAMPUS - Vos accès Enseignant",
      body: `Bonjour ${teacher.name},\n\nVotre établissement vous a inscrit en tant qu'enseignant sur la plateforme CAMPUS.\n\nVoici vos identifiants temporaires de connexion :\n- Email : ${teacher.email.trim()}\n- Mot de passe temporaire : ${tempTeacherPassword}\n\nLors de votre première connexion, vous devrez obligatoirement changer ce mot de passe temporaire.\n\nCordialement,\nL'administration académique`,
      sentAt: new Date().toISOString(),
      type: 'welcome'
    });

    // Email réel Enseignant via Nodemailer
    const loginUrl = `${window.location.origin}/connexion`;
    await sendRealEmail(
      teacher.email.trim(),
      "Bienvenue sur CAMPUS - Vos accès Enseignant",
      `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
         <h2 style="color: #4f46e5;">Bienvenue sur CAMPUS !</h2>
         <p>Bonjour <strong>${teacher.name}</strong>,</p>
         <p>Votre établissement vous a inscrit en tant qu'enseignant sur la plateforme CAMPUS.</p>
         <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 16px 0; border: 1px solid #cbd5e1;">
           <h3 style="margin-top: 0; color: #334155; font-size: 14px;">Vos identifiants temporaires de connexion :</h3>
           <p style="margin: 6px 0; font-size: 13px;"><strong>Email :</strong> ${teacher.email.trim()}</p>
           <p style="margin: 6px 0; font-size: 13px;"><strong>Mot de passe provisoire :</strong> <span style="font-family: monospace; font-size: 14px; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #0f172a;">${tempTeacherPassword}</span></p>
         </div>
         <p style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; color: #78350f; font-size: 12px; border-radius: 4px;">
           <strong>Important :</strong> Lors de votre première connexion, vous devrez obligatoirement modifier ce mot de passe temporaire pour sécuriser votre compte.
         </p>
         <p style="margin: 24px 0; text-align: center;">
           <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Se connecter à CAMPUS</a>
         </p>
         <p style="color: #64748b; font-size: 12px;">Si le bouton ne fonctionne pas, copiez-collez ce lien : <br/> <a href="${loginUrl}">${loginUrl}</a></p>
         <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
         <p style="color: #64748b; font-size: 11px;">L'administration académique</p>
       </div>`
    );

    return {
      tempTeacherPassword,
      teacherEmail: teacher.email.trim(),
      teacherName: teacher.name
    };
  },

  updateTeacher: async (universityId, teacherId, data) => {
    const teacherRef = ref(db, `universites/${universityId}/enseignants/${teacherId}`);
    await update(teacherRef, data);
  },

  addCourse: async (universityId, course) => {
    const coursesRef = ref(db, `universites/${universityId}/cours`);
    const newCourseRef = push(coursesRef);
    await set(newCourseRef, { ...course, universityId });
  },

  updateCourse: async (universityId, courseId, data) => {
    const courseRef = ref(db, `universites/${universityId}/cours/${courseId}`);
    try {
      const oldSnapshot = await get(courseRef);
      if (oldSnapshot.exists()) {
        const oldData = oldSnapshot.val();
        const oldCode = oldData.code;

        // If code, title, teacher, date, or time changed, update schedule events
        if (oldCode) {
          const schedRef = ref(db, `universites/${universityId}/emploi_du_temps`);
          const schedSnapshot = await get(schedRef);
          if (schedSnapshot.exists()) {
            const schedData = schedSnapshot.val();
            const matchingEvent = Object.entries(schedData).find(
              ([_, evt]: [string, any]) => evt && evt.courseCode === oldCode
            );
            if (matchingEvent) {
              const [evtId] = matchingEvent;
              const eventUpdate: any = {};
              if (data.code !== undefined) eventUpdate.courseCode = data.code;
              if (data.title !== undefined) eventUpdate.courseTitle = data.title;
              if (data.teacher !== undefined) eventUpdate.teacherName = data.teacher;
              if (data.startTime !== undefined) eventUpdate.startTime = data.startTime;
              if (data.duration !== undefined) eventUpdate.duration = data.duration;
              if (data.date !== undefined) {
                eventUpdate.date = data.date;
                const d = new Date(data.date);
                const day = d.getDay();
                eventUpdate.dayOfWeek = day === 0 ? 6 : day - 1; // 0 is Monday
              }

              if (Object.keys(eventUpdate).length > 0) {
                await update(ref(db, `universites/${universityId}/emploi_du_temps/${evtId}`), eventUpdate);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Error updating related schedule events", e);
    }
    await update(courseRef, data);
  },

  addTransaction: async (universityId, transaction) => {
    const transRef = ref(db, `universites/${universityId}/transactions`);
    const newTransRef = push(transRef);
    await set(newTransRef, transaction);
  },

  addGrade: async (universityId, grade) => {
    const gradesRef = ref(db, `universites/${universityId}/notes`);
    const newGradeRef = push(gradesRef);
    await set(newGradeRef, grade);
  },

  updateGrade: async (universityId, gradeId, data) => {
    const gradeRef = ref(db, `universites/${universityId}/notes/${gradeId}`);
    await update(gradeRef, data);
  },

  startLiveMeeting: async (universityId, meetingId, meetingData) => {
    const meetingRef = ref(db, `universites/${universityId}/cours_en_ligne/${meetingId}`);
    await set(meetingRef, {
      ...meetingData,
      active: true,
      createdAt: new Date().toISOString()
    });
  },

  endLiveMeeting: async (universityId, meetingId) => {
    const meetingRef = ref(db, `universites/${universityId}/cours_en_ligne/${meetingId}`);
    await remove(meetingRef);
  },

  addAssignment: async (universityId, assignment) => {
    const assignRef = ref(db, `universites/${universityId}/devoirs`);
    const newAssignRef = push(assignRef);
    await set(newAssignRef, assignment);
  },

  updateAssignment: async (universityId, assignmentId, data) => {
    const assignRef = ref(db, `universites/${universityId}/devoirs/${assignmentId}`);
    await update(assignRef, data);
  },

  addResource: async (universityId, resource) => {
    const resRef = ref(db, `universites/${universityId}/ressources`);
    const newResRef = push(resRef);
    await set(newResRef, resource);
  },

  addScheduleEvent: async (universityId, event) => {
    const schedRef = ref(db, `universites/${universityId}/emploi_du_temps`);
    const newSchedRef = push(schedRef);
    await set(newSchedRef, event);
  },

  addUniversity: async (univ) => {
    const univId = 'univ-' + Math.random().toString(36).substring(2, 9);
    const brandRef = ref(db, `universites/${univId}/branding`);
    await set(brandRef, {
      name: univ.name,
      city: univ.city,
      country: univ.country
    });
    const metaRef = ref(db, `universites/${univId}`);
    await update(metaRef, {
      plan: univ.plan,
      status: univ.status,
      createdAt: univ.createdAt
    });
  },

  addSimulatedEmail: async (universityId, email) => {
    const emailsRef = ref(db, `universites/${universityId}/emails_simules`);
    const newEmailRef = push(emailsRef);
    await set(newEmailRef, { ...email, sentAt: new Date().toISOString() });
  },

  deleteStudent: async (universityId, studentId) => {
    // Read student profile first to get parentUid (O(1) optimization)
    const studentUserRef = ref(db, `utilisateurs/${studentId}`);
    const studentUserSnap = await get(studentUserRef);
    let parentUid = '';
    if (studentUserSnap.exists()) {
      parentUid = studentUserSnap.val().parentUid || '';
    }

    // 1. Supprimer l'étudiant de l'université
    const studentRef = ref(db, `universites/${universityId}/etudiants/${studentId}`);
    await remove(studentRef);

    // 2. Supprimer l'utilisateur dans /utilisateurs
    await remove(studentUserRef);

    // 3. Supprimer le lien dans le profil parent
    if (parentUid) {
      const parentUserRef = ref(db, `utilisateurs/${parentUid}`);
      const parentSnap = await get(parentUserRef);
      if (parentSnap.exists()) {
        const profile = parentSnap.val();
        if (profile.enfants && profile.enfants[studentId]) {
          const parentChildRef = ref(db, `utilisateurs/${parentUid}/enfants/${studentId}`);
          await remove(parentChildRef);

          const updatedEnfants = { ...profile.enfants };
          delete updatedEnfants[studentId];
          if (Object.keys(updatedEnfants).length === 0) {
            await remove(parentUserRef);
          }
        }
      }
    } else {
      // Fallback for legacy data (scan users)
      const usersRef = ref(db, 'utilisateurs');
      const allUsersSnap = await get(usersRef);
      if (allUsersSnap.exists()) {
        const allUsers = allUsersSnap.val();
        for (const [uid, u] of Object.entries(allUsers)) {
          const profile = u as any;
          if (profile && profile.role === 'PARENT' && profile.enfants && profile.enfants[studentId]) {
            const parentChildRef = ref(db, `utilisateurs/${uid}/enfants/${studentId}`);
            await remove(parentChildRef);

            const updatedEnfants = { ...profile.enfants };
            delete updatedEnfants[studentId];
            if (Object.keys(updatedEnfants).length === 0) {
              await remove(ref(db, `utilisateurs/${uid}`));
            }
          }
        }
      }
    }
  },

  deleteTeacher: async (universityId, teacherId) => {
    const teacherRef = ref(db, `universites/${universityId}/enseignants/${teacherId}`);
    await remove(teacherRef);
    const userRef = ref(db, `utilisateurs/${teacherId}`);
    await remove(userRef);
  },

  deleteCourse: async (universityId, courseId) => {
    const courseRef = ref(db, `universites/${universityId}/cours/${courseId}`);
    try {
      const courseSnapshot = await get(courseRef);
      if (courseSnapshot.exists()) {
        const courseData = courseSnapshot.val();
        const courseCode = courseData.code;

        if (courseCode) {
          const schedRef = ref(db, `universites/${universityId}/emploi_du_temps`);
          const schedSnapshot = await get(schedRef);
          if (schedSnapshot.exists()) {
            const schedData = schedSnapshot.val();
            const eventToDelete = Object.entries(schedData).find(
              ([_, evt]: [string, any]) => evt && evt.courseCode === courseCode
            );
            if (eventToDelete) {
              const [evtId] = eventToDelete;
              await remove(ref(db, `universites/${universityId}/emploi_du_temps/${evtId}`));
            }
          }
        }
      }

      // Clean up grades associated with the course
      const gradesRef = ref(db, `universites/${universityId}/notes`);
      const gradesSnapshot = await get(gradesRef);
      if (gradesSnapshot.exists()) {
        const gradesData = gradesSnapshot.val();
        const deletePromises = Object.entries(gradesData)
          .filter(([_, gr]: [string, any]) => gr && gr.courseId === courseId)
          .map(([grid]) => remove(ref(db, `universites/${universityId}/notes/${grid}`)));
        await Promise.all(deletePromises);
      }
    } catch (e) {
      console.error("Error cleaning up course schedule events/grades", e);
    }
    await remove(courseRef);
  },

  deleteTransaction: async (universityId, transactionId) => {
    const transRef = ref(db, `universites/${universityId}/transactions/${transactionId}`);
    await remove(transRef);
  },

  deleteGrade: async (universityId, gradeId) => {
    const gradeRef = ref(db, `universites/${universityId}/notes/${gradeId}`);
    await remove(gradeRef);
  },

  deleteAssignment: async (universityId, assignmentId) => {
    const assignRef = ref(db, `universites/${universityId}/devoirs/${assignmentId}`);
    await remove(assignRef);
  },

  deleteResource: async (universityId, resourceId) => {
    const resRef = ref(db, `universites/${universityId}/ressources/${resourceId}`);
    await remove(resRef);
  },

  deleteScheduleEvent: async (universityId, eventId) => {
    const schedRef = ref(db, `universites/${universityId}/emploi_du_temps/${eventId}`);
    await remove(schedRef);
  },

  deleteUniversity: async (universityId) => {
    const univRef = ref(db, `universites/${universityId}`);
    await remove(univRef);
  },

  updateUniversity: async (universityId, data) => {
    const updates: Record<string, any> = {};
    if (data.name !== undefined) updates[`universites/${universityId}/branding/name`] = data.name;
    if (data.city !== undefined) updates[`universites/${universityId}/branding/city`] = data.city;
    if (data.country !== undefined) updates[`universites/${universityId}/branding/country`] = data.country;
    if (data.plan !== undefined) updates[`universites/${universityId}/plan`] = data.plan;
    if (data.status !== undefined) updates[`universites/${universityId}/status`] = data.status;
    if (data.adminUid !== undefined) updates[`universites/${universityId}/adminUid`] = data.adminUid;
    if (data.adminName !== undefined) updates[`universites/${universityId}/adminName`] = data.adminName;
    if (data.adminEmail !== undefined) updates[`universites/${universityId}/adminEmail`] = data.adminEmail;
    
    await update(ref(db), updates);
  },

  addFiliere: async (universityId, name) => {
    const sanitized = name.replace(/[.#$[\]]/g, '_');
    await set(ref(db, `universites/${universityId}/filieres/${sanitized}`), name);
  },

  deleteFiliere: async (universityId, name) => {
    const sanitized = name.replace(/[.#$[\]]/g, '_');
    await remove(ref(db, `universites/${universityId}/filieres/${sanitized}`));
  },

  addClass: async (universityId, cls) => {
    const newClassRef = push(ref(db, `universites/${universityId}/classes`));
    await set(newClassRef, cls);
  },

  deleteClass: async (universityId, classId) => {
    await remove(ref(db, `universites/${universityId}/classes/${classId}`));
  },

  addSalle: async (universityId, name) => {
    const sanitized = name.replace(/[.#$[\]]/g, '_');
    await set(ref(db, `universites/${universityId}/salles/${sanitized}`), name);
  },

  deleteSalle: async (universityId, name) => {
    const sanitized = name.replace(/[.#$[\]]/g, '_');
    await remove(ref(db, `universites/${universityId}/salles/${sanitized}`));
  },

  assignTeacherToCourse: async (universityId, teacherId, teacherName, courseId) => {
    await update(ref(db, `universites/${universityId}/cours/${courseId}`), {
      teacherId,
      teacher: teacherName
    });
  },

  updateSuggestion: async (universityId, suggestionId, data) => {
    await update(ref(db, `universites/${universityId}/suggestions/${suggestionId}`), data);
  },

  markAttendance: async (universityId, courseId, attendance) => {
    const dateKey = attendance.markedAt.split('T')[0];
    const status = attendance.status === 'absent' ? 'absent_non_justifie' : attendance.status;
    const callRef = ref(db, `universites/${universityId}/appels/${courseId}/${dateKey}/${attendance.studentId}`);
    await set(callRef, {
      status,
      updatedAt: attendance.markedAt
    });
  },

  addGestionnaire: async (universityId, data) => {
    const tempPassword = 'GES-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    let uid = '';
    const tempAppName = `temp-staff-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);
    try {
      const creds = await createUserWithEmailAndPassword(tempAuth, data.email.trim(), tempPassword);
      uid = creds.user.uid;
    } catch (err: any) {
      await deleteApp(tempApp);
      if (err.code === 'auth/email-already-in-use') {
        throw new Error("L'adresse email est déjà utilisée.");
      }
      throw err;
    }
    await deleteApp(tempApp);

    // Enregistrer le gestionnaire dans l'université
    const refGest = ref(db, `universites/${universityId}/gestionnaires/${uid}`);
    await set(refGest, {
      id: uid,
      name: data.name,
      email: data.email.trim(),
      role: data.role,
      status: 'actif',
      createdAt: new Date().toISOString(),
      universityId
    });

    // Créer le profil dans /utilisateurs
    const refUser = ref(db, `utilisateurs/${uid}`);
    const prenom = data.name.split(' ')[0] || '';
    const nom = data.name.split(' ').slice(1).join(' ') || data.name;
    await set(refUser, {
      uid,
      email: data.email.trim(),
      role: data.role,
      status: 'active',
      universityId,
      prenom,
      nom,
      telephone: '',
      adresse: '',
      createdDate: new Date().toISOString(),
      mustChangePassword: true,
      tempPassword
    });

    // Envoyer l'email de bienvenue simulé
    const emailsRef = ref(db, `universites/${universityId}/emails_simules`);
    const newEmailRef = push(emailsRef);
    const roleLabel = data.role === 'FINANCE_MANAGER' ? 'Gestionnaire Financier'
      : data.role === 'STUDENT_MANAGER' ? 'Gestionnaire Étudiants'
      : 'Gestionnaire Enseignants';
    await set(newEmailRef, {
      to: data.email.trim(),
      recipientName: data.name,
      subject: "Bienvenue sur CAMPUS - Vos accès Gestionnaire",
      body: `Bonjour ${data.name},\n\nL'administrateur de votre établissement vous a désigné comme gestionnaire sur la plateforme CAMPUS.\n\nRôle : ${roleLabel}\nEmail : ${data.email.trim()}\nMot de passe temporaire : ${tempPassword}\n\nLors de votre première connexion, vous devrez obligatoirement changer ce mot de passe temporaire.\n\nCordialement,\nL'administration académique`,
      sentAt: new Date().toISOString(),
      type: 'welcome'
    });

    // Email réel via Nodemailer
    const loginUrl = `${window.location.origin}/connexion`;
    await sendRealEmail(
      data.email.trim(),
      "Bienvenue sur CAMPUS - Vos accès Gestionnaire",
      `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
         <h2 style="color: #4f46e5;">Bienvenue sur CAMPUS !</h2>
         <p>Bonjour <strong>${data.name}</strong>,</p>
         <p>L'administrateur de votre établissement vous a désigné(e) comme <strong>${roleLabel}</strong> sur la plateforme CAMPUS.</p>
         <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 16px 0; border: 1px solid #cbd5e1;">
           <h3 style="margin-top: 0; color: #334155; font-size: 14px;">Vos identifiants temporaires de connexion :</h3>
           <p style="margin: 6px 0; font-size: 13px;"><strong>Email :</strong> ${data.email.trim()}</p>
           <p style="margin: 6px 0; font-size: 13px;"><strong>Rôle :</strong> ${roleLabel}</p>
           <p style="margin: 6px 0; font-size: 13px;"><strong>Mot de passe provisoire :</strong> <span style="font-family: monospace; font-size: 14px; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #0f172a;">${tempPassword}</span></p>
         </div>
         <p style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; color: #78350f; font-size: 12px; border-radius: 4px;">
           <strong>Important :</strong> Lors de votre première connexion, vous devrez obligatoirement modifier ce mot de passe temporaire pour sécuriser votre compte.
         </p>
         <p style="margin: 24px 0; text-align: center;">
           <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Se connecter à CAMPUS</a>
         </p>
         <p style="color: #64748b; font-size: 12px;">Si le bouton ne fonctionne pas, copiez-collez ce lien : <br/> <a href="${loginUrl}">${loginUrl}</a></p>
         <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
         <p style="color: #64748b; font-size: 11px;">L'administration académique</p>
       </div>`
    );

    return { tempPassword };
  },

  updateGestionnaire: async (universityId, uid, data) => {
    await update(ref(db, `universites/${universityId}/gestionnaires/${uid}`), data);
    await update(ref(db, `utilisateurs/${uid}`), data);

    // Envoyer email si délégation d'accès admin activée
    const delegationData = (data as any).delegation;
    if (delegationData?.active === true) {
      try {
        // Récupérer les infos du gestionnaire
        const gestRef = ref(db, `universites/${universityId}/gestionnaires/${uid}`);
        const gestSnap = await get(gestRef);
        if (gestSnap.exists()) {
          const gest = gestSnap.val();
          const expiryDate = new Date(delegationData.expiresAt).toLocaleString('fr-FR');
          const loginUrl = `${window.location.origin}/connexion`;
          await sendRealEmail(
            gest.email,
            "Accès Administrateur délégués - CAMPUS",
            `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
               <h2 style="color: #4f46e5;">Accès Administrateur temporaires</h2>
               <p>Bonjour <strong>${gest.name}</strong>,</p>
               <p>L'administrateur de votre établissement vous a accordé un <strong>accès administrateur temporaire</strong> sur la plateforme CAMPUS.</p>
               <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 16px 0;">
                 <p style="margin: 0; font-size: 13px; color: #78350f;"><strong>⏰ Expiration :</strong> ${expiryDate}</p>
                 <p style="margin: 6px 0 0; font-size: 12px; color: #92400e;">Passé ce délai, vos droits administrateur seront automatiquement révoqués.</p>
               </div>
               <p style="margin: 24px 0; text-align: center;">
                 <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Accéder à CAMPUS</a>
               </p>
               <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
               <p style="color: #64748b; font-size: 11px;">L'administration académique</p>
             </div>`
          );
        }
      } catch (emailErr) {
        console.error('[updateGestionnaire] Erreur email délégation:', emailErr);
      }
    }
  },

  deleteGestionnaire: async (universityId, uid) => {
    await remove(ref(db, `universites/${universityId}/gestionnaires/${uid}`));
    await remove(ref(db, `utilisateurs/${uid}`));
  }
}));
