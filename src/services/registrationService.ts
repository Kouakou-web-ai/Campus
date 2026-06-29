import { ref, onValue, type Unsubscribe, get, update, set, remove, push } from 'firebase/database';
import { db } from '../../firebase-config';
import type { UserRole } from '../store/authStore';
import type { UserProfile, UserStatus } from '../types/userAccount';
import { normalizeUserStatus } from '../constants/accountStatus';

function parseUserRecord(uid: string, data: Record<string, unknown>): UserProfile | null {
  if (!data || typeof data !== 'object') return null;

  const rawPrenom = data.prenom ? String(data.prenom) : '';
  const rawNom = data.nom ? String(data.nom) : '';
  let prenom = rawPrenom;
  let nom = rawNom;

  if (!prenom && rawNom.includes(' ')) {
    const parts = rawNom.trim().split(/\s+/);
    prenom = parts[0] ?? '';
    nom = parts.slice(1).join(' ') || parts[0] || '';
  } else if (!nom && prenom) {
    nom = prenom;
  }

  return {
    uid,
    prenom,
    nom,
    email: String(data.email ?? ''),
    role: (data.role as UserRole) ?? 'STUDENT',
    universityId: data.universityId ? String(data.universityId) : null,
    status: normalizeUserStatus(data.status as string | undefined),
    createdDate: String(data.createdDate ?? new Date().toISOString()),
    telephone: data.telephone ? String(data.telephone) : undefined,
    adresse: data.adresse ? String(data.adresse) : undefined,
  };
}

export function parseUsersSnapshot(raw: Record<string, Record<string, unknown>> | null): UserProfile[] {
  if (!raw) return [];
  return Object.entries(raw)
    .map(([uid, data]) => parseUserRecord(uid, data))
    .filter((u): u is UserProfile => u !== null);
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  const usersRef = ref(db, 'utilisateurs');
  const snapshot = await get(usersRef);
  return parseUsersSnapshot(snapshot.val());
}

export function subscribeToUsers(onData: (users: UserProfile[]) => void): Unsubscribe {
  const usersRef = ref(db, 'utilisateurs');
  return onValue(usersRef, (snapshot) => {
    onData(parseUsersSnapshot(snapshot.val()));
  });
}

export async function updateUserStatus(uid: string, status: UserStatus): Promise<void> {
  // 1. Récupérer le profil complet de l'utilisateur
  const userRef = ref(db, `utilisateurs/${uid}`);
  const userSnapshot = await get(userRef);
  if (!userSnapshot.exists()) {
    throw new Error("Profil utilisateur introuvable.");
  }
  const userData = userSnapshot.val();

  const role = (userData.role as UserRole) || 'STUDENT';
  const universityId = userData.universityId ? String(userData.universityId) : null;
  const rawPrenom = userData.prenom ? String(userData.prenom) : '';
  const rawNom = userData.nom ? String(userData.nom) : '';
  const fullName = rawPrenom ? `${rawPrenom} ${rawNom}`.trim() : (rawNom || String(userData.email ?? ''));

  // 2. Si c'est un administrateur d'université qu'on active, vérifier l'unicité
  if (role === 'UNIVERSITY_ADMIN' && status === 'active' && universityId) {
    const allUsersRef = ref(db, 'utilisateurs');
    const allUsersSnapshot = await get(allUsersRef);
    const allUsers = allUsersSnapshot.val() || {};
    const hasActiveAdmin = Object.entries(allUsers).some(
      ([otherUid, u]: [string, any]) =>
        otherUid !== uid &&
        u &&
        u.universityId === universityId &&
        u.role === 'UNIVERSITY_ADMIN' &&
        u.status === 'active'
    );
    if (hasActiveAdmin) {
      throw new Error("Cette université possède déjà un administrateur actif.");
    }
  }

  // 3. Mettre à jour le statut dans /utilisateurs
  await update(ref(db, `utilisateurs/${uid}`), {
    status,
    statusUpdatedAt: new Date().toISOString(),
  });

  // 4. Synchroniser avec le nœud de l'université correspondante
  if (universityId) {
    if (status === 'active') {
      if (role === 'STUDENT') {
        const univSnapshot = await get(ref(db, `universites/${universityId}`));
        if (univSnapshot.exists()) {
          const univData = univSnapshot.val();
          const plan = univData.plan || 'pro';
          const limit = plan === 'starter' ? 500 : plan === 'pro' ? 5000 : Infinity;
          
          const studentsSnapshot = await get(ref(db, `universites/${universityId}/etudiants`));
          const currentCount = studentsSnapshot.exists() ? Object.keys(studentsSnapshot.val()).length : 0;
          
          if (currentCount >= limit) {
            throw new Error(`Limite d'abonnés atteinte pour cette université (${plan === 'starter' ? 'Starter : 500' : 'Pro : 5000'} étudiants maximum).`);
          }
        }

        const studentId = userData.studentId ? String(userData.studentId) : `ETU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        await set(ref(db, `universites/${universityId}/etudiants/${uid}`), {
          name: fullName,
          email: String(userData.email ?? ''),
          studentId,
          filiere: userData.filiere ? String(userData.filiere) : 'Informatique',
          annee: Number(userData.annee ?? 1),
          status: 'actif',
          average: 0,
          absences: 0,
          paidAmount: 0,
          totalAmount: 0,
          universityId,
          createdAt: new Date().toISOString(),
        });
        // Email de bienvenue étudiant
        const emailsRef = ref(db, `universites/${universityId}/emails_simules`);
        await push(emailsRef, {
          to: String(userData.email ?? ''),
          recipientName: fullName,
          subject: "Bienvenue sur CAMPUS - Votre compte Étudiant est actif",
          body: `Bonjour ${fullName},\n\nFélicitations, votre inscription a été validée ! Votre numéro d'étudiant est ${studentId}.\n\nVous pouvez vous connecter dès à présent pour suivre vos cours, vos notes et vos plannings.\n\nCordialement,\nL'administration académique`,
          sentAt: new Date().toISOString(),
          type: 'welcome'
        });
      } else if (role === 'TEACHER') {
        await set(ref(db, `universites/${universityId}/enseignants/${uid}`), {
          name: fullName,
          email: String(userData.email ?? ''),
          specialite: userData.specialite ? String(userData.specialite) : 'Général',
          coursCount: 0,
          studentsCount: 0,
          rating: 5,
          hoursPerWeek: 0,
          status: 'actif',
          universityId,
          createdAt: new Date().toISOString(),
        });
        // Email de bienvenue enseignant
        const emailsRef = ref(db, `universites/${universityId}/emails_simules`);
        await push(emailsRef, {
          to: String(userData.email ?? ''),
          recipientName: fullName,
          subject: "Activation de votre compte Enseignant",
          body: `Bonjour ${fullName},\n\nVotre compte d'enseignant a été validé par la direction. Vous pouvez désormais vous connecter pour gérer vos cours, saisir les notes de vos étudiants et publier les devoirs.\n\nCordialement,\nL'administration académique`,
          sentAt: new Date().toISOString(),
          type: 'welcome'
        });
      } else if (role === 'UNIVERSITY_ADMIN') {
        await update(ref(db, `universites/${universityId}`), {
          adminUid: uid,
          adminName: fullName,
          adminEmail: String(userData.email ?? ''),
          status: 'actif',
        });
        // Email de bienvenue administrateur
        const emailsRef = ref(db, `universites/${universityId}/emails_simules`);
        await push(emailsRef, {
          to: String(userData.email ?? ''),
          recipientName: fullName,
          subject: "Félicitations - Votre portail d'établissement est actif !",
          body: `Bonjour ${fullName},\n\nNous avons le plaisir de vous informer que votre demande d'administration pour l'établissement a été validée par le Super Administrateur CAMPUS.\n\nVous pouvez désormais accéder à votre tableau de bord d'administration, inscrire des étudiants, assigner des enseignants et suivre le centre financier.\n\nCordialement,\nL'équipe CAMPUS`,
          sentAt: new Date().toISOString(),
          type: 'welcome'
        });

        // Réactiver tous les comptes liés à cette université
        const allUsersRef = ref(db, 'utilisateurs');
        const allUsersSnapshot = await get(allUsersRef);
        const allUsers = allUsersSnapshot.val() || {};
        const uidsToModify = Object.entries(allUsers)
          .filter(([otherUid, u]: [string, any]) => u && u.universityId === universityId && otherUid !== uid)
          .map(([otherUid, u]: [string, any]) => ({ uid: otherUid, role: u.role }));

        for (const otherUser of uidsToModify) {
          await update(ref(db, `utilisateurs/${otherUser.uid}`), {
            status: 'active',
            statusUpdatedAt: new Date().toISOString(),
          });
          if (otherUser.role === 'STUDENT') {
            await update(ref(db, `universites/${universityId}/etudiants/${otherUser.uid}`), {
              status: 'actif'
            });
          } else if (otherUser.role === 'TEACHER') {
            await update(ref(db, `universites/${universityId}/enseignants/${otherUser.uid}`), {
              status: 'actif'
            });
          }
        }
      }
    } else if (status === 'suspended' || status === 'rejected') {
      const dbStatus = status === 'suspended' ? 'suspendu' : 'inactif';
      if (role === 'STUDENT') {
        if (status === 'rejected') {
          await remove(ref(db, `universites/${universityId}/etudiants/${uid}`));
        } else {
          await update(ref(db, `universites/${universityId}/etudiants/${uid}`), {
            status: dbStatus
          });
        }
      } else if (role === 'TEACHER') {
        if (status === 'rejected') {
          await remove(ref(db, `universites/${universityId}/enseignants/${uid}`));
        } else {
          await update(ref(db, `universites/${universityId}/enseignants/${uid}`), {
            status: dbStatus
          });
        }
      } else if (role === 'UNIVERSITY_ADMIN') {
        const univStatus = status === 'suspended' ? 'suspendu' : 'inactif';
        await update(ref(db, `universites/${universityId}`), {
          status: univStatus,
          adminUid: null,
          adminName: null,
          adminEmail: null,
        });

        // Suspendre ou désactiver tous les comptes liés à cette université
        const allUsersRef = ref(db, 'utilisateurs');
        const allUsersSnapshot = await get(allUsersRef);
        const allUsers = allUsersSnapshot.val() || {};
        const uidsToModify = Object.entries(allUsers)
          .filter(([otherUid, u]: [string, any]) => u && u.universityId === universityId && otherUid !== uid)
          .map(([otherUid, u]: [string, any]) => ({ uid: otherUid, role: u.role }));

        for (const otherUser of uidsToModify) {
          await update(ref(db, `utilisateurs/${otherUser.uid}`), {
            status,
            statusUpdatedAt: new Date().toISOString(),
          });
          if (otherUser.role === 'STUDENT') {
            if (status === 'rejected') {
              await remove(ref(db, `universites/${universityId}/etudiants/${otherUser.uid}`));
            } else {
              await update(ref(db, `universites/${universityId}/etudiants/${otherUser.uid}`), {
                status: dbStatus
              });
            }
          } else if (otherUser.role === 'TEACHER') {
            if (status === 'rejected') {
              await remove(ref(db, `universites/${universityId}/enseignants/${otherUser.uid}`));
            } else {
              await update(ref(db, `universites/${universityId}/enseignants/${otherUser.uid}`), {
                status: dbStatus
              });
            }
          }
        }
      }
    }
  }
}

export async function deleteUserAccount(uid: string): Promise<void> {
  const userRef = ref(db, `utilisateurs/${uid}`);
  const userSnapshot = await get(userRef);
  if (!userSnapshot.exists()) {
    throw new Error("Profil utilisateur introuvable.");
  }
  const userData = userSnapshot.val();
  const role = userData.role || 'STUDENT';
  const universityId = userData.universityId;

  if (universityId) {
    if (role === 'STUDENT') {
      await remove(ref(db, `universites/${universityId}/etudiants/${uid}`));
    } else if (role === 'TEACHER') {
      await remove(ref(db, `universites/${universityId}/enseignants/${uid}`));
    } else if (role === 'UNIVERSITY_ADMIN') {
      // Supprimer tous les comptes liés à cette université
      const allUsersRef = ref(db, 'utilisateurs');
      const allUsersSnapshot = await get(allUsersRef);
      const allUsers = allUsersSnapshot.val() || {};
      const uidsToDelete = Object.entries(allUsers)
        .filter(([otherUid, u]: [string, any]) => u && u.universityId === universityId && otherUid !== uid)
        .map(([otherUid]) => otherUid);

      for (const otherUid of uidsToDelete) {
        await remove(ref(db, `utilisateurs/${otherUid}`));
      }

      // Supprimer l'université entière
      await remove(ref(db, `universites/${universityId}`));
    }
  }

  await remove(userRef);
}
