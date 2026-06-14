import { create } from 'zustand';
import { applyTheme } from './themeStore';
import { auth, googleProvider } from '../../firebase-config';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, deleteUser, updatePassword, reauthenticateWithCredential, EmailAuthProvider, signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { normalizeUserStatus } from '../constants/accountStatus';
import type { UserStatus } from '../types/userAccount';

export type UserRole = 'SUPER_ADMIN' | 'UNIVERSITY_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  login: async (role, email = 'user@campus.fr') => {
    set({ loading: true });
    const mockUser: User = {
      id: `usr-${role.toLowerCase()}`,
      name: `Démo ${role.replace('_', ' ')}`,
      email,
      role,
      status: 'active',
      universityId: role === 'SUPER_ADMIN' ? null : 'univ-ufhb',
    };
    
    await new Promise((resolve) => setTimeout(resolve, 800));

    set({ 
      user: mockUser,
      isAuthenticated: true, 
      loading: false 
    });
  },

  loginWithFirebase: async (email, password) => {
    set({ loading: true });
    try {
      const data = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = data.user;

      if (!fbUser.emailVerified) {
        await sendEmailVerification(fbUser);
        await signOut(auth);
        throw new Error("Compte non vérifié. Un email vous a été envoyé pour valider votre compte.");
      }

      const token = await fbUser.getIdToken();
      const dbUrl = import.meta.env.VITE_databaseURL;
      const response = await axios.get(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`);
      const userData = response.data;

      if (!userData) {
        throw new Error("Détails de l'utilisateur introuvables.");
      }

      const prenom = userData.prenom || '';
      const nom = userData.nom || fbUser.displayName || 'Utilisateur';
      const fullName = prenom ? `${prenom} ${nom}`.trim() : nom;

      set({
        user: {
          id: fbUser.uid,
          name: fullName,
          prenom: prenom || undefined,
          email: fbUser.email || email,
          role: userData.role || 'STUDENT',
          universityId: userData.universityId || 'univ-ufhb',
          status: normalizeUserStatus(userData.status as string | undefined),
          telephone: userData.telephone,
          adresse: userData.adresse,
          createdDate: userData.createdDate,
          filiere: userData.filiere,
          annee: userData.annee,
          specialite: userData.specialite,
        },
        isAuthenticated: true,
        loading: false
      });
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

      set({
        user: {
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
        },
        isAuthenticated: true,
        loading: false
      });
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
      set({ user: null, isAuthenticated: false, loading: false });
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

    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            name: fullName,
            prenom: prenom || undefined,
            status: normalizeUserStatus(userData.status as string | undefined),
            role: userData.role || state.user.role,
            universityId: userData.universityId ?? state.user.universityId,
            filiere: userData.filiere ?? state.user.filiere,
            annee: userData.annee ?? state.user.annee,
            specialite: userData.specialite ?? state.user.specialite,
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
      if (data.currentPassword && data.newPassword) {
        if (!fbUser.email) throw new Error("Email manquant.");
        const credential = EmailAuthProvider.credential(fbUser.email, data.currentPassword);
        await reauthenticateWithCredential(fbUser, credential);
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
}));
