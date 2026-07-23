import { create } from 'zustand';
import { applyTheme } from './themeStore';
import { auth, googleProvider } from '../../firebase-config';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, deleteUser, updatePassword, reauthenticateWithCredential, EmailAuthProvider, signInWithPopup, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { normalizeUserStatus } from '../constants/accountStatus';
import type { UserStatus } from '../types/userAccount';
import { dbLocal } from '../lib/db';

async function saveSessionToLocal(uid: string, token: string, user: any) {
  try {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 jours
    await dbLocal.session.clear(); // Garde une session unique pour la sécurité
    await dbLocal.session.put({
      id: uid,
      token,
      expiresAt,
      user
    });
    console.log("[Auth] Session enregistrée hors ligne pour 7 jours.");
  } catch (err) {
    console.error("[Auth] Échec d'écriture de la session locale :", err);
  }
}

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return (
    e.startsWith('truixk@') ||
    e.startsWith('truixk') ||
    e.startsWith('superadmin') ||
    e.includes('superadmin') ||
    e === 'superadmin@campus-app.com'
  );
}

async function resolveUserRoleAndDelegation(userData: any, fbUser: any, dbUrl: string, token: string) {
  const now = new Date();
  let role = isSuperAdminEmail(userData?.email || fbUser?.email) ? 'SUPER_ADMIN' : (userData?.role || 'STUDENT');
  let delegation = userData.delegation;
  
  if (delegation && delegation.active) {
    const expiresAt = new Date(delegation.expiresAt);
    if (now < expiresAt) {
      role = 'UNIVERSITY_ADMIN';
    } else {
      // Deactivate expired delegation in DB
      try {
        await axios.patch(`${dbUrl}/utilisateurs/${fbUser.uid}/delegation.json?auth=${token}`, {
          active: false
        });
        if (userData.universityId) {
          await axios.patch(`${dbUrl}/universites/${userData.universityId}/gestionnaires/${fbUser.uid}/delegation.json?auth=${token}`, {
            active: false
          });
        }
      } catch (err) {
        console.error("Failed to auto-deactivate expired delegation:", err);
      }
      delegation = { ...delegation, active: false };
      role = userData.role;
    }
  }
  return { role, delegation };
}

export type UserRole = 'SUPER_ADMIN' | 'UNIVERSITY_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'FINANCE_MANAGER' | 'STUDENT_MANAGER' | 'TEACHER_MANAGER';

export interface User {
  id: string;
  name: string;
  prenom?: string;
  email: string;
  role: UserRole;
  universityId: string | null;
  status: UserStatus;
  telephone?: string;
  adresse?: string;
  createdDate?: string;
  filiere?: string;
  annee?: number;
  specialite?: string;
  mustChangePassword?: boolean;
  tempPassword?: string;
  delegation?: {
    active: boolean;
    expiresAt: string;
    originalRole: UserRole;
    delegatedBy: string;
  };
  mfaEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (role: UserRole, email?: string) => Promise<void>;
  loginWithFirebase: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithFirebase: (
    email: string,
    password: string,
    prenom: string,
    nom: string,
    telephone: string,
    adresse: string,
    role: UserRole,
    universityId: string | null,
    filiere?: string,
    annee?: number,
    specialite?: string,
  ) => Promise<void>;
  activateInvitedAccount: (
    email: string,
    password: string,
    prenom: string,
    nom: string,
    telephone: string,
    adresse: string,
    universityId: string,
    invitedUid: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateUserProfile: (data: { name?: string; currentPassword?: string; newPassword?: string; theme?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  switchUniversity: (universityId: string) => void;
  sessionExpiredOffline?: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  sessionExpiredOffline: false,

  switchUniversity: (universityId: string) => {
    set((state) => {
      if (state.user) {
        return {
          user: {
            ...state.user,
            universityId
          }
        };
      }
      return {};
    });
  },

  login: async (role, email = 'user@campus.fr') => {
    set({ loading: true });
    const mockUser: User = {
      id: role === 'TEACHER' ? 't1' : role === 'STUDENT' ? 's1' : `usr-${role.toLowerCase()}`,
      name: role === 'TEACHER' ? 'Prof. Koffi Kouamé Alexandre' : role === 'STUDENT' ? 'Koffi Yao Stéphane' : `Démo ${role.replace('_', ' ')}`,
      email: role === 'TEACHER' ? 'a.koffi@univ-ufhb.ci' : role === 'STUDENT' ? 'stephane.koffi@univ-ufhb.ci' : email,
      role,
      status: 'active',
      universityId: role === 'SUPER_ADMIN' ? null : 'univ-ufhb',
      filiere: role === 'STUDENT' ? 'Informatique' : undefined,
      annee: role === 'STUDENT' ? 3 : undefined,
    };
    
    await new Promise((resolve) => setTimeout(resolve, 800));

    set({ 
      user: mockUser,
      isAuthenticated: true, 
      loading: false,
      sessionExpiredOffline: false
    });
    await saveSessionToLocal(mockUser.id, 'mock-token', mockUser);
  },

  loginWithFirebase: async (email, password) => {
    set({ loading: true });
    try {
      // Force sign out to clear any potentially corrupted local auth state
      try {
        await signOut(auth);
      } catch (e) {
        // ignore
      }
      
      let data;
      try {
        console.log("Attempting signInWithEmailAndPassword...");
        data = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        console.log("Sign-in successful", data.user.uid);
      } catch (e: any) {
        console.error("signInWithEmailAndPassword failed:", e);
        throw e;
      }
      
      const fbUser = data.user;

      let token;
      try {
        console.log("Attempting getIdToken...");
        token = await fbUser.getIdToken();
        console.log("getIdToken successful");
      } catch (e: any) {
        console.error("getIdToken failed:", e);
        throw e;
      }

      const dbUrl = import.meta.env.VITE_databaseURL;
      const response = await axios.get(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`);
      let userData = response.data;

      if (!userData && fbUser.email) {
        try {
          const allUsersResp = await axios.get(`${dbUrl}/utilisateurs.json?auth=${token}`);
          const allUsers = allUsersResp.data || {};
          const matchedEntry = Object.entries(allUsers).find(
            ([_, u]: [string, any]) => u && u.email && fbUser.email && u.email.toLowerCase() === fbUser.email.toLowerCase()
          );
          if (matchedEntry) {
            const [existingKey, existingData] = matchedEntry;
            userData = existingData;
            await axios.put(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`, {
              ...(existingData as Record<string, any>),
              id: fbUser.uid
            });
            if (existingKey !== fbUser.uid) {
              await axios.delete(`${dbUrl}/utilisateurs/${existingKey}.json?auth=${token}`);
            }
          }
        } catch (searchErr) {
          console.error("Failed to search user by email fallback:", searchErr);
        }
      }

      if (!userData) {
        // Auto-create missing user profile node in RTDB if account exists in Auth but profile node was missing
        const userEmail = fbUser.email || email;
        const forceSuperAdmin = isSuperAdminEmail(userEmail);
        const nameParts = (fbUser.displayName || userEmail.split('@')[0] || 'Utilisateur').split(' ');
        const prenom = nameParts[0] || 'Utilisateur';
        const nom = nameParts.slice(1).join(' ') || '';
        
        userData = {
          prenom,
          nom: nom || prenom,
          email: userEmail,
          role: forceSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          universityId: forceSuperAdmin ? null : 'univ-ufhb',
          status: 'active',
          createdDate: new Date().toISOString(),
        };

        try {
          await axios.put(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`, userData);
        } catch (createErr) {
          console.error("Failed to auto-create missing user profile in RTDB:", createErr);
        }
      } else if (isSuperAdminEmail(fbUser.email || email || userData.email)) {
        if (userData.role !== 'SUPER_ADMIN' || userData.universityId !== null) {
          userData.role = 'SUPER_ADMIN';
          userData.universityId = null;
          try {
            await axios.patch(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`, {
              role: 'SUPER_ADMIN',
              universityId: null
            });
          } catch (patchErr) {
            console.error("Failed to update user to SUPER_ADMIN in RTDB:", patchErr);
          }
        }
      }

      // Vérification d'adresse e-mail obligatoire pour les comptes actifs (hors mot de passe temporaire)
      if (!fbUser.emailVerified && userData.status === 'active' && !userData.mustChangePassword && !userData.tempPassword) {
        try {
          await sendEmailVerification(fbUser);
        } catch (authVerifyErr) {
          console.error("Firebase sendEmailVerification failed:", authVerifyErr);
        }
        
        try {
          const { notifyEmailConfirmationSpamNotice } = await import('../services/emailSender');
          await notifyEmailConfirmationSpamNotice(fbUser.email || email);
        } catch (sendErr) {
          console.error("notifyEmailConfirmationSpamNotice failed in loginWithFirebase:", sendErr);
        }

        await signOut(auth);
        throw new Error("Compte non vérifié. Un email de vérification vous a été envoyé (pensez à vérifier vos spams).");
      }

      if (userData.status === 'pending') {
        await signOut(auth);
        throw new Error("Votre compte est en attente de validation par le super administrateur.");
      }

      const prenom = userData.prenom || '';
      const nom = userData.nom || fbUser.displayName || 'Utilisateur';
      const fullName = prenom ? `${prenom} ${nom}`.trim() : nom;

      const { role: resolvedRole, delegation: resolvedDelegation } = await resolveUserRoleAndDelegation(userData, fbUser, dbUrl, token);

      const userObj = {
        id: fbUser.uid,
        name: fullName,
        prenom: prenom || undefined,
        email: fbUser.email || email,
        role: resolvedRole,
        universityId: resolvedRole === 'SUPER_ADMIN' ? null : (userData.universityId || 'univ-ufhb'),
        status: normalizeUserStatus(userData.status as string | undefined),
        telephone: userData.telephone,
        adresse: userData.adresse,
        createdDate: userData.createdDate,
        filiere: userData.filiere,
        annee: userData.annee,
        specialite: userData.specialite,
        mustChangePassword: userData.mustChangePassword || false,
        tempPassword: userData.tempPassword || undefined,
        delegation: resolvedDelegation,
        mfaEnabled: userData.mfaEnabled || false,
      };

      set({
        user: userObj,
        isAuthenticated: true,
        loading: false,
        sessionExpiredOffline: false
      });

      await saveSessionToLocal(fbUser.uid, token, userObj);
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true });
    try {
      const data = await signInWithPopup(auth, googleProvider);
      const fbUser = data.user;
      
      const token = await fbUser.getIdToken();
      const dbUrl = import.meta.env.VITE_databaseURL;
      
      // Check if user exists
      let userData;
      try {
        const response = await axios.get(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`);
        userData = response.data;
      } catch (err) {
        // If not found or error, we'll create below
      }

      if (userData && userData.role === 'SUPER_ADMIN') {
        await signOut(auth);
        throw new Error("La connexion Google n'est pas autorisée pour le rôle Super Administrateur. Veuillez utiliser votre e-mail et mot de passe.");
      }

      const prenom = userData?.prenom || fbUser.displayName?.split(' ')[0] || '';
      const nom = userData?.nom || fbUser.displayName?.split(' ').slice(1).join(' ') || '';
      const fullName = prenom ? `${prenom} ${nom}`.trim() : (nom || 'Utilisateur');
      const email = fbUser.email || '';

      if (userData && userData.status === 'pending') {
        // Upgrade them to active immediately (demo mode shortcut)
        await axios.patch(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`, { status: 'active' });
        userData.status = 'active';
        
        // Ensure student record exists
        const studentId = `ETU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        await axios.put(`${dbUrl}/universites/univ-ufhb/etudiants/${fbUser.uid}.json?auth=${token}`, {
          id: fbUser.uid,
          name: fullName,
          email,
          studentId,
          universityId: 'univ-ufhb',
          status: 'actif',
          updatedAt: new Date().toISOString()
        });
      }

      if (!userData) {
        // Create new user in DB if it doesn't exist
        await axios.put(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`, {
          prenom,
          nom,
          email,
          role: 'STUDENT',
          status: 'active',
          universityId: 'univ-ufhb',
          uid: fbUser.uid,
          createdDate: new Date().toISOString(),
        });
        
        // Also create student record so dashboard works
        const studentId = `ETU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        await axios.put(`${dbUrl}/universites/univ-ufhb/etudiants/${fbUser.uid}.json?auth=${token}`, {
          id: fbUser.uid,
          name: fullName,
          email,
          studentId,
          universityId: 'univ-ufhb',
          status: 'actif',
          updatedAt: new Date().toISOString()
        });

        userData = {
          role: 'STUDENT',
          status: 'active',
          universityId: 'univ-ufhb',
        };
      }

      const userObj = {
        id: fbUser.uid,
        name: fullName,
        prenom: prenom || undefined,
        email,
        role: userData.role,
        universityId: userData.universityId,
        status: normalizeUserStatus(userData.status as string | undefined),
        telephone: userData.telephone,
        adresse: userData.adresse,
        createdDate: userData.createdDate,
        filiere: userData.filiere,
        annee: userData.annee,
        specialite: userData.specialite,
      };

      set({
        user: userObj,
        isAuthenticated: true,
        loading: false,
        sessionExpiredOffline: false
      });

      await saveSessionToLocal(fbUser.uid, token, userObj);
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  signupWithFirebase: async (email, password, prenom, nom, telephone, adresse, role, universityId, filiere, annee, specialite) => {
    set({ loading: true });
    try {
      const data = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = data.user;
      const displayName = `${prenom} ${nom}`.trim();

      await updateProfile(fbUser, { displayName });

      const token = await fbUser.getIdToken();
      const dbUrl = import.meta.env.VITE_databaseURL;

      await axios.put(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`, {
        prenom,
        nom,
        email,
        telephone,
        adresse,
        role,
        status: 'pending',
        universityId: universityId || 'univ-ufhb',
        uid: fbUser.uid,
        createdDate: new Date().toISOString(),
        filiere: filiere || undefined,
        annee: annee !== undefined ? Number(annee) : undefined,
        specialite: specialite || undefined,
      });

      // Notifier le Super Admin de la création de n'importe quel compte
      try {
        const { sendRealEmail } = await import('../services/emailSender');
        const loginUrl = `${window.location.origin}/connexion`;
        
        let roleLabel = role as string;
        if (role === 'UNIVERSITY_ADMIN') roleLabel = "Administrateur d'Université";
        else if (role === 'STUDENT') roleLabel = "Étudiant";
        else if (role === 'TEACHER') roleLabel = "Enseignant";
        else if (role === 'PARENT') roleLabel = "Parent";
        else if (role === 'FINANCE_MANAGER') roleLabel = "Gestionnaire Financier";
        else if (role === 'STUDENT_MANAGER') roleLabel = "Gestionnaire Étudiants";
        else if (role === 'TEACHER_MANAGER') roleLabel = "Gestionnaire Enseignants";

        await sendRealEmail(
          'Truixk@gmail.com',
          `Nouveau compte enregistré (${roleLabel}) - CAMPUS`,
          `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
             <h2 style="color: #4f46e5;">Nouveau Compte Enregistré</h2>
             <p>Bonjour Super Administrateur,</p>
             <p>Un nouveau compte a été créé sur la plateforme CAMPUS avec les informations suivantes :</p>
             <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 16px 0; border: 1px solid #cbd5e1; font-size: 13px;">
               <p style="margin: 4px 0;"><strong>Type de Compte :</strong> ${roleLabel}</p>
               <p style="margin: 4px 0;"><strong>Nom complet :</strong> ${prenom} ${nom}</p>
               <p style="margin: 4px 0;"><strong>Email :</strong> ${email}</p>
               <p style="margin: 4px 0;"><strong>Téléphone :</strong> ${telephone || 'Non renseigné'}</p>
               <p style="margin: 4px 0;"><strong>Université / Établissement ID :</strong> ${universityId || 'Non renseigné'}</p>
             </div>
             <p>Vous pouvez vous connecter à votre tableau de bord pour valider ou gérer ce compte si nécessaire.</p>
             <p style="margin: 24px 0; text-align: center;">
               <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Se connecter au portail</a>
             </p>
             <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
             <p style="color: #64748b; font-size: 11px;">Service de Notification CAMPUS</p>
           </div>`
        );
      } catch (mailErr) {
        console.error("Erreur lors de la notification de l'admin pour le nouveau compte:", mailErr);
      }

      await sendEmailVerification(fbUser);
      await signOut(auth);
      set({ loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  activateInvitedAccount: async (email, password, prenom, nom, telephone, adresse, universityId, invitedUid) => {
    set({ loading: true });
    try {
      const dbUrl = import.meta.env.VITE_databaseURL;

      // 1. Fetch the temporary user profile to know their role
      let invitedUser: any = null;
      try {
        const userResponse = await axios.get(`${dbUrl}/utilisateurs/${invitedUid}.json`);
        invitedUser = userResponse.data;
      } catch (err) {
        console.warn("Could not find temporary user profile record", err);
      }
      const role = invitedUser?.role || 'STUDENT';
      const entityPath = role === 'TEACHER' ? 'enseignants' : 'etudiants';

      // 2. Fetch the temporary academic/professional record if it exists
      let invitedEntity: any = null;
      try {
        const entityResponse = await axios.get(`${dbUrl}/universites/${universityId}/${entityPath}/${invitedUid}.json`);
        invitedEntity = entityResponse.data;
      } catch (err) {
        console.warn(`Could not find temporary ${role} record`, err);
      }

      // 3. Create the user in Firebase Auth
      const data = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = data.user;
      const displayName = `${prenom} ${nom}`.trim();
      await updateProfile(fbUser, { displayName });

      const token = await fbUser.getIdToken();

      // 4. Create the real user profile with status 'active'
      await axios.put(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`, {
        prenom,
        nom,
        email,
        telephone,
        adresse,
        role,
        status: 'active',
        universityId,
        uid: fbUser.uid,
        createdDate: new Date().toISOString(),
        filiere: invitedEntity?.filiere || undefined,
        annee: invitedEntity?.annee !== undefined ? Number(invitedEntity.annee) : undefined,
        specialite: invitedEntity?.specialite || undefined,
      });

      // 5. Create the real student or teacher record using details from the invitation
      if (role === 'TEACHER') {
        await axios.put(`${dbUrl}/universites/${universityId}/enseignants/${fbUser.uid}.json?auth=${token}`, {
          ...(invitedEntity || {}),
          id: fbUser.uid,
          name: displayName,
          email,
          universityId,
          status: 'actif',
          updatedAt: new Date().toISOString()
        });
      } else {
        const studentId = invitedEntity?.studentId || `ETU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        await axios.put(`${dbUrl}/universites/${universityId}/etudiants/${fbUser.uid}.json?auth=${token}`, {
          ...(invitedEntity || {}),
          id: fbUser.uid,
          name: displayName,
          email,
          studentId,
          universityId,
          status: 'actif',
          updatedAt: new Date().toISOString()
        });
      }

      // 6. Delete the temporary records
      try {
        await axios.delete(`${dbUrl}/utilisateurs/${invitedUid}.json?auth=${token}`);
      } catch (e) {
        console.error("Error deleting temporary utilisateur record", e);
      }
      try {
        await axios.delete(`${dbUrl}/universites/${universityId}/${entityPath}/${invitedUid}.json?auth=${token}`);
      } catch (e) {
        console.error(`Error deleting temporary ${role} record`, e);
      }

      // 7. Send verification email and sign out
      await sendEmailVerification(fbUser);
      await signOut(auth);
      set({ loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    } finally {
      try {
        await dbLocal.session.clear();
        await Promise.all([
          dbLocal.students.clear(),
          dbLocal.teachers.clear(),
          dbLocal.courses.clear(),
          dbLocal.transactions.clear(),
          dbLocal.grades.clear(),
          dbLocal.assignments.clear(),
          dbLocal.resources.clear(),
          dbLocal.scheduleEvents.clear(),
          dbLocal.announcements.clear(),
          dbLocal.emailsSimules.clear(),
          dbLocal.cahierDeTextes.clear(),
          dbLocal.quizzes.clear(),
          dbLocal.appels.clear(),
          dbLocal.filieres.clear(),
          dbLocal.classes.clear(),
          dbLocal.salles.clear(),
          dbLocal.evaluations.clear(),
          dbLocal.suggestions.clear(),
          dbLocal.gestionnaires.clear(),
          dbLocal.liveMeetings.clear(),
          dbLocal.metadata.clear()
        ]);
      } catch (dbErr) {
        console.error("Failed to clear local cache on logout:", dbErr);
      }
      set({ user: null, isAuthenticated: false, loading: false, sessionExpiredOffline: false });
    }
  },

  refreshUserProfile: async () => {
    const fbUser = auth.currentUser;
    if (!fbUser) return;

    const token = await fbUser.getIdToken();
    const dbUrl = import.meta.env.VITE_databaseURL;
    const response = await axios.get(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`);
    const userData = response.data;
    if (!userData) return;

    const prenom = userData.prenom || '';
    const nom = userData.nom || fbUser.displayName || 'Utilisateur';
    const fullName = prenom ? `${prenom} ${nom}`.trim() : nom;

    const { role: resolvedRole, delegation: resolvedDelegation } = await resolveUserRoleAndDelegation(userData, fbUser, dbUrl, token);

    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            name: fullName,
            prenom: prenom || undefined,
            status: normalizeUserStatus(userData.status as string | undefined),
            role: resolvedRole,
            universityId: userData.universityId ?? state.user.universityId,
            filiere: userData.filiere ?? state.user.filiere,
            annee: userData.annee ?? state.user.annee,
            specialite: userData.specialite ?? state.user.specialite,
            mustChangePassword: userData.mustChangePassword || false,
            tempPassword: userData.tempPassword || undefined,
            delegation: resolvedDelegation,
            mfaEnabled: userData.mfaEnabled || false,
          }
        : null,
    }));
  },

  updateUserProfile: async (data) => {
    const fbUser = auth.currentUser;
    if (!fbUser) throw new Error("Aucun utilisateur connecté.");
    
    set({ loading: true });
    try {
      const token = await fbUser.getIdToken();
      const dbUrl = import.meta.env.VITE_databaseURL;

      // Update password if requested
      if (data.newPassword) {
        if (data.currentPassword) {
          if (!fbUser.email) throw new Error("Email manquant.");
          const credential = EmailAuthProvider.credential(fbUser.email, data.currentPassword);
          await reauthenticateWithCredential(fbUser, credential);
        }
        await updatePassword(fbUser, data.newPassword);
      }

      // Update name if requested
      if (data.name && data.name !== fbUser.displayName) {
        await updateProfile(fbUser, { displayName: data.name });
        
        // We also need to update the realtime database depending on the structure
        // Since we store 'nom' and 'prenom', we might just split the name for simplicity
        const parts = data.name.split(' ');
        const prenom = parts[0];
        const nom = parts.slice(1).join(' ') || prenom;
        
        await axios.patch(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`, {
          prenom,
          nom
        });

        // Also update in the specific role table
        const { user } = useAuthStore.getState();
        if (user && user.universityId) {
          if (user.role === 'STUDENT') {
            await axios.patch(`${dbUrl}/universites/${user.universityId}/etudiants/${fbUser.uid}.json?auth=${token}`, {
              name: data.name
            });
          } else if (user.role === 'TEACHER') {
            await axios.patch(`${dbUrl}/universites/${user.universityId}/enseignants/${fbUser.uid}.json?auth=${token}`, {
              name: data.name
            });
          }
        }
      }

      // Refresh the local state
      await useAuthStore.getState().refreshUserProfile();
      
      // Update theme if requested
      if (data.theme) {
        applyTheme(data.theme as any);
        localStorage.setItem('campus-theme', data.theme);
      }

      set({ loading: false });
    } catch (err: any) {
      set({ loading: false });
      if (err.code === 'auth/invalid-credential') {
        throw new Error("Le mot de passe actuel est incorrect.");
      }
      throw err;
    }
  },

  deleteAccount: async () => {
    const fbUser = auth.currentUser;
    if (!fbUser) throw new Error("Aucun utilisateur connecté.");

    set({ loading: true });
    try {
      const token = await fbUser.getIdToken();
      const dbUrl = import.meta.env.VITE_databaseURL;

      // 1. Get the current user profile from database to know their role and university
      const response = await axios.get(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`);
      const userData = response.data;

      if (userData) {
        const role = userData.role;
        const universityId = userData.universityId;

        // 2. Delete the record in the university's lists depending on the role
        if (universityId) {
          if (role === 'STUDENT') {
            await axios.delete(`${dbUrl}/universites/${universityId}/etudiants/${fbUser.uid}.json?auth=${token}`);
          } else if (role === 'TEACHER') {
            await axios.delete(`${dbUrl}/universites/${universityId}/enseignants/${fbUser.uid}.json?auth=${token}`);
          } else if (role === 'UNIVERSITY_ADMIN') {
            // Remove the admin from university metadata
            await axios.patch(`${dbUrl}/universites/${universityId}.json?auth=${token}`, {
              adminUid: null,
              adminName: null,
              adminEmail: null,
            });
          }
        }
      }

      // 3. Delete the profile record in /utilisateurs
      await axios.delete(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`);

      // 4. Delete the Firebase Auth user account
      await deleteUser(fbUser);

      // 5. Sign out
      await signOut(auth);

      set({ user: null, isAuthenticated: false, loading: false });
    } catch (err: any) {
      set({ loading: false });
      if (err.code === 'auth/requires-recent-login') {
        throw new Error("Sécurité : Veuillez vous déconnecter et vous reconnecter, puis réessayer la suppression.");
      }
      throw err;
    }
  },

  sendPasswordReset: async (email) => {
    set({ loading: true });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
}));

// Écouteur global pour gérer la session et empêcher la connexion multi-comptes
onAuthStateChanged(auth, async (fbUser) => {
  const state = useAuthStore.getState();
  
  // Utilisation de syncStore pour détecter l'état réseau
  let isOnline = true;
  try {
    const { useSyncStore } = await import('./syncStore');
    isOnline = await useSyncStore.getState().checkConnection();
  } catch (err) {
    console.error("Failed to check connection in auth state listener:", err);
  }

  if (fbUser) {
    if (state.isAuthenticated && state.user?.id === fbUser.uid) {
      return;
    }
    if (!state.user || state.user.id !== fbUser.uid) {
      useAuthStore.setState({ loading: true });
      try {
        if (!isOnline) {
          const cachedSession = await dbLocal.session.get(fbUser.uid);
          if (cachedSession) {
            if (cachedSession.expiresAt > Date.now()) {
              useAuthStore.setState({
                user: cachedSession.user,
                isAuthenticated: true,
                loading: false,
                sessionExpiredOffline: false
              });
              return;
            } else {
              useAuthStore.setState({
                user: null,
                isAuthenticated: false,
                loading: false,
                sessionExpiredOffline: true
              });
              return;
            }
          }
        }

        const token = await fbUser.getIdToken();
        const dbUrl = import.meta.env.VITE_databaseURL;
        const response = await axios.get(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`);
        let userData = response.data;

        if (!userData && fbUser.email) {
          try {
            const allUsersResp = await axios.get(`${dbUrl}/utilisateurs.json?auth=${token}`);
            const allUsers = allUsersResp.data || {};
            const matchedEntry = Object.entries(allUsers).find(
              ([_, u]: [string, any]) => u && u.email && fbUser.email && u.email.toLowerCase() === fbUser.email.toLowerCase()
            );
            if (matchedEntry) {
              const [existingKey, existingData] = matchedEntry;
              userData = existingData;
              await axios.put(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`, {
                ...(existingData as Record<string, any>),
                id: fbUser.uid
              });
              if (existingKey !== fbUser.uid) {
                await axios.delete(`${dbUrl}/utilisateurs/${existingKey}.json?auth=${token}`);
              }
            }
          } catch (searchErr) {
            console.error("Failed email lookup fallback in onAuthStateChanged:", searchErr);
          }
        }
        if (userData && isSuperAdminEmail(userData.email || fbUser.email)) {
          userData.role = 'SUPER_ADMIN';
          userData.universityId = null;
        }

        if (userData) {
          const prenom = userData.prenom || '';
          const nom = userData.nom || fbUser.displayName || 'Utilisateur';
          const fullName = prenom ? `${prenom} ${nom}`.trim() : nom;
          
          const { role: resolvedRole, delegation: resolvedDelegation } = await resolveUserRoleAndDelegation(userData, fbUser, dbUrl, token);

          const userObj = {
            id: fbUser.uid,
            name: fullName,
            prenom: prenom || undefined,
            email: fbUser.email || '',
            role: resolvedRole,
            universityId: userData.universityId || 'univ-ufhb',
            status: normalizeUserStatus(userData.status as string | undefined),
            telephone: userData.telephone,
            adresse: userData.adresse,
            createdDate: userData.createdDate,
            filiere: userData.filiere,
            annee: userData.annee,
            specialite: userData.specialite,
            mustChangePassword: userData.mustChangePassword || false,
            tempPassword: userData.tempPassword || undefined,
            delegation: resolvedDelegation,
            mfaEnabled: userData.mfaEnabled || false,
          };

          useAuthStore.setState({
            user: userObj,
            isAuthenticated: true,
            loading: false,
            sessionExpiredOffline: false
          });

          await saveSessionToLocal(fbUser.uid, token, userObj);
        } else {
          useAuthStore.setState({ loading: false });
        }
      } catch (err) {
        console.error("Erreur lors de la synchronisation de session:", err);
        useAuthStore.setState({ loading: false });
      }
    }
  } else {
    // Si pas de fbUser, mais qu'on est hors ligne, on regarde s'il y a une session en cache
    if (!isOnline) {
      try {
        const cachedSessions = await dbLocal.session.toArray();
        if (cachedSessions.length > 0) {
          const cachedSession = cachedSessions[0];
          if (cachedSession.expiresAt > Date.now()) {
            useAuthStore.setState({
              user: cachedSession.user,
              isAuthenticated: true,
              loading: false,
              sessionExpiredOffline: false
            });
            return;
          } else {
            useAuthStore.setState({
              user: null,
              isAuthenticated: false,
              loading: false,
              sessionExpiredOffline: true
            });
            return;
          }
        }
      } catch (dbErr) {
        console.error("Failed to read local session cache:", dbErr);
      }
    }

    const isDemo = state.user?.id.startsWith('usr-') || state.user?.id === 't1' || state.user?.id === 's1';
    if (state.isAuthenticated && !isDemo) {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        sessionExpiredOffline: false
      });
    } else {
      if (state.loading) {
        useAuthStore.setState({ loading: false });
      }
    }
  }
});

