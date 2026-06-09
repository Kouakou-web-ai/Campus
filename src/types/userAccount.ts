import type { UserRole } from '../store/authStore';

export type UserStatus = 'pending' | 'active' | 'rejected' | 'suspended';

export interface UserProfile {
  uid: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  universityId: string | null;
  status: UserStatus;
  createdDate: string;
  telephone?: string;
  adresse?: string;
}

export interface RegistrationRequest extends UserProfile {
  universityName?: string;
}
