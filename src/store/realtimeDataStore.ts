import { create } from 'zustand';
import { useNotificationStore } from './notificationStore';
import { db, auth, firebaseConfig } from '../../firebase-config';
import { ref, onValue, set, push, update, remove, get } from 'firebase/database';
import type { Student, Teacher, Course, Transaction, Grade, Assignment, Resource, ScheduleEvent, University, RevenueData, StatusType, Class } from '../types';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

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
  currentUniversity: University | null;
  announcements: any[];
  emailsSimules: any[];
  cahierDeTextes: any[];
  quizzes: any[];
  appels: any;
  loading: boolean;
  filieres: string[];
  classes: Class[];
  evaluations: any[];
  suggestions: any[];
  
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
  assignTeacherToCourse: (universityId: string, teacherId: string, teacherName: string, courseId: string) => Promise<void>;
  updateSuggestion: (universityId: string, suggestionId: string, data: Partial<any>) => Promise<void>;
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
  evaluations: [],
  suggestions: [],

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

    // 1. Branding
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/branding`), (snap) => {
      branding = snap.val() || {};
      updateCurrentUniversity();
    }));

    // 2. Plan
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/plan`), (snap) => {
      plan = snap.val() || 'pro';
      updateCurrentUniversity();
    }));

    // 3. Status
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/status`), (snap) => {
      status = snap.val() || 'actif';
      updateCurrentUniversity();
    }));

    // 4. CreatedAt
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/createdAt`), (snap) => {
      createdAt = snap.val() || new Date().toISOString().split('T')[0];
      updateCurrentUniversity();
    }));

    // 5. Admin Uid
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/adminUid`), (snap) => {
      adminUid = snap.val() || undefined;
      updateCurrentUniversity();
    }));

    // 6. Admin Name
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/adminName`), (snap) => {
      adminName = snap.val() || undefined;
      updateCurrentUniversity();
    }));

    // 7. Admin Email
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/adminEmail`), (snap) => {
      adminEmail = snap.val() || undefined;
      updateCurrentUniversity();
    }));

    // 8. Étudiants
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/etudiants`), (snap) => {
      const list = parseList(snap.val());
      studentsCount = list.length;
      setStore({ students: list });
      updateCurrentUniversity();
    }));

    // 9. Enseignants
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/enseignants`), (snap) => {
      const list = parseList(snap.val());
      teachersCount = list.length;
      setStore({ teachers: list });
      updateCurrentUniversity();
    }));

    // 10. Cours
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/cours`), (snap) => {
      setStore({ courses: parseList(snap.val()) });
    }));

    // 11. Transactions
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/transactions`), (snap) => {
      setStore({ transactions: parseList(snap.val()) });
    }));

    // 12. Notes (Grades)
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/notes`), (snap) => {
      setStore({ grades: parseList(snap.val()) });
    }));

    // 13. Devoirs (Assignments)
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/devoirs`), (snap) => {
      setStore({ assignments: parseList(snap.val()) });
    }));

    // 14. Ressources
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/ressources`), (snap) => {
      setStore({ resources: parseList(snap.val()) });
    }));

    // 15. Emploi du temps
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/emploi_du_temps`), (snap) => {
      setStore({ scheduleEvents: parseList(snap.val()) });
    }));

    // 16. Annonces
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/annonces`), (snap) => {
      setStore({ announcements: parseList(snap.val()) });
    }));

    // 17. Emails simulés
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/emails_simules`), (snap) => {
      setStore({ emailsSimules: parseList(snap.val()) });
    }));

    // 18. Cahier de textes
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/cahier_de_textes`), (snap) => {
      setStore({ cahierDeTextes: parseList(snap.val()) });
    }));

    // 19. Quizzes
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/quizzes`), (snap) => {
      setStore({ quizzes: parseList(snap.val()) });
    }));

    // 20. Appels (Absences)
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/appels`), (snap) => {
      setStore({ appels: snap.val() || {} });
    }));

    // Evaluations real-time listener for admins
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
      const userRole = useAuthStore.getState().user?.role;
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

    // Suggestions real-time listener for admins
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
      const userRole = useAuthStore.getState().user?.role;
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

    // 21. Filières
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/filieres`), (snap) => {
      const val = snap.val();
      if (val) {
        setStore({ filieres: Object.values(val) });
      } else {
        const defaultFilieres = ['Informatique', 'Mathématiques', 'Économie', 'Droit', 'Physique'];
        setStore({ filieres: defaultFilieres });
      }
    }));

    // 22. Classes
    unsubscribers.push(onValue(ref(db, `universites/${universityId}/classes`), (snap) => {
      const val = snap.val();
      if (val) {
        setStore({ classes: Object.keys(val).map(key => ({ id: key, ...val[key] })), loading: false });
      } else {
        const defaultClasses: Class[] = [
          { id: 'c1', name: 'Licence 1 Informatique', filiere: 'Informatique', annee: 1 },
          { id: 'c2', name: 'Licence 2 Informatique', filiere: 'Informatique', annee: 2 },
          { id: 'c3', name: 'Licence 3 Informatique', filiere: 'Informatique', annee: 3 },
          { id: 'c4', name: 'Licence 1 Mathématiques', filiere: 'Mathématiques', annee: 1 },
        ];
        setStore({ classes: defaultClasses, loading: false });
      }
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

    return unsubscribeUnivs;
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

    // 4. Vérifier si le parent existe déjà dans /utilisateurs
    let parentUid = '';
    const usersRef = ref(db, 'utilisateurs');
    const allUsersSnap = await get(usersRef);
    if (allUsersSnap.exists()) {
      const allUsers = allUsersSnap.val();
      const existingParent = Object.entries(allUsers).find(
        ([_, u]: [string, any]) => u && u.email?.toLowerCase() === parentEmail.trim().toLowerCase() && u.role === 'PARENT'
      );
      if (existingParent) {
        parentUid = existingParent[0];
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

    // 6. Enregistrer l'étudiant dans la liste de l'université
    const studentUnivRef = ref(db, `universites/${universityId}/etudiants/${studentUid}`);
    await set(studentUnivRef, {
      ...studentInfo,
      id: studentUid,
      studentId,
      universityId,
      status: 'actif',
      createdAt: new Date().toISOString()
    });

    // 7. Enregistrer le profil étudiant dans /utilisateurs
    const studentUserRef = ref(db, `utilisateurs/${studentUid}`);
    const sPrenom = (studentInfo as any).prenom || studentInfo.name.split(' ')[0] || '';
    const sNom = (studentInfo as any).nom || studentInfo.name.split(' ').slice(1).join(' ') || studentInfo.name;
    await set(studentUserRef, {
      uid: studentUid,
      email: studentInfo.email.trim(),
      role: 'STUDENT',
      status: 'active',
      universityId,
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
      body: `Bonjour ${studentInfo.name},\n\nVotre inscription à l'université a été validée. Votre compte étudiant a été créé.\n\nVoici vos identifiants temporaires de connexion :\n- Email : ${studentInfo.email.trim()}\n- Matricule : ${studentId}\n- Mot de passe temporaire : ${tempStudentPassword}\n\nLors de votre première connexion, vous devrez obligatoirement changer ce mot de passe temporaire.\n\nCordialement,\nL'administration académique`,
      sentAt: new Date().toISOString(),
      type: 'welcome'
    });

    // E-mail parent
    const parentEmailRef = push(emailsRef);
    await set(parentEmailRef, {
      to: parentEmail.trim(),
      recipientName: parentName,
      subject: "Bienvenue sur CAMPUS - Vos accès Parent",
      body: `Bonjour ${parentName},\n\nVotre compte de suivi parent pour l'étudiant(e) ${studentInfo.name} (Matricule : ${studentId}) a été créé automatiquement.\n\nVoici vos identifiants temporaires de connexion :\n- Email : ${parentEmail.trim()}\n- Matricule de l'enfant : ${studentId}\n- Mot de passe temporaire : ${tempParentPassword}\n\nLors de votre première connexion, vous devrez obligatoirement changer ce mot de passe temporaire.\n\nCordialement,\nL'administration académique`,
      sentAt: new Date().toISOString(),
      type: 'welcome'
    });

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
    // 1. Supprimer l'étudiant de l'université
    const studentRef = ref(db, `universites/${universityId}/etudiants/${studentId}`);
    await remove(studentRef);

    // 2. Supprimer l'utilisateur dans /utilisateurs
    const userRef = ref(db, `utilisateurs/${studentId}`);
    await remove(userRef);

    // 3. Supprimer le lien dans le profil parent
    const usersRef = ref(db, 'utilisateurs');
    const allUsersSnap = await get(usersRef);
    if (allUsersSnap.exists()) {
      const allUsers = allUsersSnap.val();
      for (const [uid, u] of Object.entries(allUsers)) {
        const profile = u as any;
        if (profile && profile.role === 'PARENT' && profile.enfants && profile.enfants[studentId]) {
          const parentChildRef = ref(db, `utilisateurs/${uid}/enfants/${studentId}`);
          await remove(parentChildRef);

          // Si le parent n'a plus d'autres enfants liés, supprimer son compte
          const updatedEnfants = { ...profile.enfants };
          delete updatedEnfants[studentId];
          if (Object.keys(updatedEnfants).length === 0) {
            await remove(ref(db, `utilisateurs/${uid}`));
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
    } catch (e) {
      console.error("Error cleaning up course schedule events", e);
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
    const filieresRef = ref(db, `universites/${universityId}/filieres`);
    const snapshot = await get(filieresRef);
    if (!snapshot.exists()) {
      const defaults = ['Informatique', 'Mathématiques', 'Économie', 'Droit', 'Physique'];
      for (const d of defaults) {
        await set(ref(db, `universites/${universityId}/filieres/${d.replace(/[.#$[\]]/g, '_')}`), d);
      }
    }
    const sanitized = name.replace(/[.#$[\]]/g, '_');
    await set(ref(db, `universites/${universityId}/filieres/${sanitized}`), name);
  },

  deleteFiliere: async (universityId, name) => {
    const filieresRef = ref(db, `universites/${universityId}/filieres`);
    const snapshot = await get(filieresRef);
    if (!snapshot.exists()) {
      const defaults = ['Informatique', 'Mathématiques', 'Économie', 'Droit', 'Physique'];
      for (const d of defaults) {
        if (d !== name) {
          await set(ref(db, `universites/${universityId}/filieres/${d.replace(/[.#$[\]]/g, '_')}`), d);
        }
      }
    } else {
      const sanitized = name.replace(/[.#$[\]]/g, '_');
      await remove(ref(db, `universites/${universityId}/filieres/${sanitized}`));
    }
  },

  addClass: async (universityId, cls) => {
    const classesRef = ref(db, `universites/${universityId}/classes`);
    const snapshot = await get(classesRef);
    if (!snapshot.exists()) {
      const defaultClasses = [
        { name: 'Licence 1 Informatique', filiere: 'Informatique', annee: 1 },
        { name: 'Licence 2 Informatique', filiere: 'Informatique', annee: 2 },
        { name: 'Licence 3 Informatique', filiere: 'Informatique', annee: 3 },
        { name: 'Licence 1 Mathématiques', filiere: 'Mathématiques', annee: 1 },
      ];
      for (const dc of defaultClasses) {
        const newRef = push(ref(db, `universites/${universityId}/classes`));
        await set(newRef, dc);
      }
    }
    const newClassRef = push(ref(db, `universites/${universityId}/classes`));
    await set(newClassRef, cls);
  },

  deleteClass: async (universityId, classId) => {
    const classesRef = ref(db, `universites/${universityId}/classes`);
    const snapshot = await get(classesRef);
    if (!snapshot.exists()) {
      const defaultClasses = [
        { id: 'c1', name: 'Licence 1 Informatique', filiere: 'Informatique', annee: 1 },
        { id: 'c2', name: 'Licence 2 Informatique', filiere: 'Informatique', annee: 2 },
        { id: 'c3', name: 'Licence 3 Informatique', filiere: 'Informatique', annee: 3 },
        { id: 'c4', name: 'Licence 1 Mathématiques', filiere: 'Mathématiques', annee: 1 },
      ];
      for (const dc of defaultClasses) {
        if (dc.id !== classId) {
          await set(ref(db, `universites/${universityId}/classes/${dc.id}`), {
            name: dc.name,
            filiere: dc.filiere,
            annee: dc.annee
          });
        }
      }
    } else {
      await remove(ref(db, `universites/${universityId}/classes/${classId}`));
    }
  },

  assignTeacherToCourse: async (universityId, teacherId, teacherName, courseId) => {
    await update(ref(db, `universites/${universityId}/cours/${courseId}`), {
      teacherId,
      teacher: teacherName
    });
  },

  updateSuggestion: async (universityId, suggestionId, data) => {
    await update(ref(db, `universites/${universityId}/suggestions/${suggestionId}`), data);
  }
}));
