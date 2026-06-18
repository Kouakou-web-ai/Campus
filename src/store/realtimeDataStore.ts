import { create } from 'zustand';
import { db, auth } from '../../firebase-config';
import { ref, onValue, set, push, update, remove, get } from 'firebase/database';
import type { Student, Teacher, Course, Transaction, Grade, Assignment, Resource, ScheduleEvent, University, RevenueData, StatusType } from '../types';

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
  loading: boolean;
  
  subscribeToUniversity: (universityId: string) => () => void;
  subscribeToSuperAdmin: () => () => void;
  
  addStudent: (universityId: string, student: Omit<Student, 'id' | 'universityId'>) => Promise<void>;
  updateStudent: (universityId: string, studentId: string, data: Partial<Student>) => Promise<void>;
  addTeacher: (universityId: string, teacher: Omit<Teacher, 'id' | 'universityId'>) => Promise<void>;
  updateTeacher: (universityId: string, teacherId: string, data: Partial<Teacher>) => Promise<void>;
  addCourse: (universityId: string, course: Omit<Course, 'id' | 'universityId'>) => Promise<void>;
  updateCourse: (universityId: string, courseId: string, data: Partial<Course>) => Promise<void>;
  addTransaction: (universityId: string, transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addGrade: (universityId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
  updateGrade: (universityId: string, gradeId: string, data: Partial<Grade>) => Promise<void>;
  addAssignment: (universityId: string, assignment: Omit<Assignment, 'id'>) => Promise<void>;
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
  loading: false,

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
      if (plan === 'enterprise') mrrVal = 12450000;
      else if (plan === 'pro') mrrVal = 3800000;
      else mrrVal = 650000;

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
      setStore({ quizzes: parseList(snap.val()), loading: false });
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
        if (u.plan === 'enterprise') mrrVal = 12450000;
        else if (u.plan === 'pro') mrrVal = 3800000;
        else mrrVal = 650000;

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

  addStudent: async (universityId, student) => {
    const studentsRef = ref(db, `universites/${universityId}/etudiants`);
    const newStudentRef = push(studentsRef);
    const studentUid = newStudentRef.key;
    if (!studentUid) return;
    const activationUrl = `${window.location.origin}/activation-compte?email=${encodeURIComponent(student.email)}`;

    // 1. Enregistrer l'étudiant dans l'université avec son identifiant UID temporaire
    await set(newStudentRef, {
      ...student,
      id: studentUid,
      universityId,
      createdAt: new Date().toISOString()
    });

    // 2. Créer l'invitation dans /utilisateurs
    const invitedUserRef = ref(db, `utilisateurs/${studentUid}`);
    const prenom = student.name.split(' ')[0] || '';
    const nom = student.name.split(' ').slice(1).join(' ') || student.name;

    await set(invitedUserRef, {
      uid: studentUid,
      email: student.email,
      role: 'STUDENT',
      status: 'invited',
      universityId,
      prenom,
      nom,
      telephone: '',
      adresse: '',
      createdDate: new Date().toISOString()
    });

    // 3. Envoyer un e-mail de simulation d'activation sécurisée
    const emailsRef = ref(db, `universites/${universityId}/emails_simules`);
    const newEmailRef = push(emailsRef);
    await set(newEmailRef, {
      to: student.email,
      recipientName: student.name,
      subject: "Invitation à activer votre compte CAMPUS",
      body: `Bonjour ${student.name},\n\nVotre établissement vous a inscrit sur la plateforme CAMPUS.\n\nVeuillez activer votre compte et configurer votre mot de passe en cliquant sur ce lien :\n${activationUrl}\n\nCordialement,\nL'administration académique`,
      sentAt: new Date().toISOString(),
      type: 'welcome'
    });
  },

  updateStudent: async (universityId, studentId, data) => {
    const studentRef = ref(db, `universites/${universityId}/etudiants/${studentId}`);
    await update(studentRef, data);
  },

  addTeacher: async (universityId, teacher) => {
    const teachersRef = ref(db, `universites/${universityId}/enseignants`);
    const newTeacherRef = push(teachersRef);
    const teacherUid = newTeacherRef.key;
    if (!teacherUid) return;
    const activationUrl = `${window.location.origin}/activation-compte?email=${encodeURIComponent(teacher.email)}`;

    // 1. Enregistrer l'enseignant dans l'université avec son identifiant UID temporaire
    await set(newTeacherRef, {
      ...teacher,
      id: teacherUid,
      universityId,
      createdAt: new Date().toISOString()
    });

    // 2. Créer l'invitation dans /utilisateurs
    const invitedUserRef = ref(db, `utilisateurs/${teacherUid}`);
    const prenom = teacher.name.split(' ')[0] || '';
    const nom = teacher.name.split(' ').slice(1).join(' ') || teacher.name;

    await set(invitedUserRef, {
      uid: teacherUid,
      email: teacher.email,
      role: 'TEACHER',
      status: 'invited',
      universityId,
      prenom,
      nom,
      telephone: '',
      adresse: '',
      createdDate: new Date().toISOString()
    });

    // 3. Envoyer un e-mail de simulation d'activation sécurisée
    const emailsRef = ref(db, `universites/${universityId}/emails_simules`);
    const newEmailRef = push(emailsRef);
    await set(newEmailRef, {
      to: teacher.email,
      recipientName: teacher.name,
      subject: "Invitation à activer votre compte Enseignant CAMPUS",
      body: `Bonjour ${teacher.name},\n\nVotre établissement vous a inscrit en tant qu'enseignant sur la plateforme CAMPUS.\n\nVeuillez activer votre compte et configurer votre mot de passe en cliquant sur ce lien :\n${activationUrl}\n\nCordialement,\nL'administration académique`,
      sentAt: new Date().toISOString(),
      type: 'welcome'
    });
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
    const studentRef = ref(db, `universites/${universityId}/etudiants/${studentId}`);
    await remove(studentRef);
    const userRef = ref(db, `utilisateurs/${studentId}`);
    await remove(userRef);
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
  }
}));
