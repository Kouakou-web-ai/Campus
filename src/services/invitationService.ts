import { get, ref } from 'firebase/database';
import { db } from '../../firebase-config';
import type { UserRole } from '../store/authStore';

export interface InvitedUserProfile {
  uid?: string;
  email: string;
  role: UserRole;
  status: 'invited';
  universityId: string;
  prenom?: string;
  nom?: string;
  telephone?: string;
  adresse?: string;
}

export interface InvitedUser {
  uid: string;
  profile: InvitedUserProfile;
}

export async function findInvitedUserByEmail(email: string): Promise<InvitedUser | null> {
  const targetEmail = email.trim().toLowerCase();
  if (!targetEmail) return null;

  const usersRef = ref(db, 'utilisateurs');
  const snapshot = await get(usersRef);
  if (!snapshot.exists()) return null;

  const usersData = snapshot.val();
  const invitedEntry = Object.entries(usersData).find(([, userData]) => {
    const profile = userData as Partial<InvitedUserProfile> | null;
    return (
      profile?.email?.toLowerCase() === targetEmail &&
      profile.status === 'invited'
    );
  });

  if (!invitedEntry) return null;

  const [uid, profile] = invitedEntry as [string, InvitedUserProfile];
  return { uid, profile };
}
