---
name: role-based-signatures
description: >
  Implements or fixes the CAMPUS bulletin signature system. Use when the user asks to:
  - Implement, fix, or secure the signature system on grade bulletins
  - Restrict which roles can sign which signature slots
  - Set up persistent single-signature per user (store once, auto-apply everywhere)
  - Add Firebase security rules for signature paths
  - Debug "wrong role can sign" or "teacher signs another teacher course" issues
  Roles: UNIVERSITY_ADMIN signs Chef de departement footer slot only.
  FINANCE_MANAGER signs Responsable de scolarite footer slot only.
  TEACHER signs only their own courses (course.teacherId === user.id).
---

# CAMPUS Role-Based Signature System

## Architecture

Each user signs once. Signature stored in Firebase at `utilisateurs/{uid}/signature` as base64 PNG.
Auto-applied to correct slots on every bulletin based on role.

## Role Slot Mapping (STRICT)

| Role | Allowed slot | Forbidden |
|------|-------------|-----------|
| UNIVERSITY_ADMIN | recteur (Chef de departement footer) | secretariat, course rows |
| FINANCE_MANAGER | secretariat (Responsable de scolarite footer) | recteur, course rows |
| TEACHER | Course rows where course.teacherId === user.id | Other courses, footer slots |

## Key Constants (Bulletins.tsx)

```ts
const canSignDept      = user?.role === "UNIVERSITY_ADMIN"; // NOT TEACHER
const canSignScolarite = user?.role === "FINANCE_MANAGER";
const canSignCourse = (courseTeacherId?: string) =>
  user?.role === "TEACHER" && !!courseTeacherId && courseTeacherId === user.id;
const hasSignatureRight = canSignDept || canSignScolarite || isTeacher;
```

## Handler Guards (REQUIRED)

```ts
// handleApplyOfficialSignature
if (type === "recteur" && user?.role !== "UNIVERSITY_ADMIN") { ToastError(...); return; }
if (type === "secretariat" && user?.role !== "FINANCE_MANAGER") { ToastError(...); return; }

// handleApplyCourseSignature
if (user?.role !== "TEACHER") { ToastError(...); return; }
const course = studentCourses.find(c => c.id === courseId);
if (!course || course.teacherId !== user.id) { ToastError(...); return; }
```

## UI Rules

- Course sig column header: only if user?.role === "TEACHER"
- Course sig cell: show lock 🔒 for courses not owned by this teacher
- Footer secretariat: show if canSignScolarite only
- Footer recteur: show if canSignDept only
- Toolbar "Ma Signature" button: show if hasSignatureRight

## Firebase Security Rules (database.rules.json)

```json
"utilisateurs": { "$uid": { "signature": { ".write": "auth.uid === $uid" } } },
"universites": { "$universityId": { 
  "etudiants": { "$studentId": { "signatures": {
    "secretariat": { ".write": "root.child('utilisateurs').child(auth.uid).child('role').val() === 'FINANCE_MANAGER'" },
    "recteur":     { ".write": "root.child('utilisateurs').child(auth.uid).child('role').val() === 'UNIVERSITY_ADMIN'" }
  }}},
  "notes": { "$gradeId": { "teacherSignature": {
    ".write": "root.child('utilisateurs').child(auth.uid).child('role').val() === 'TEACHER'"
  }}}
}}
```

Deploy: `firebase deploy --only database`

## Common Mistakes

- canSignDept must NOT include TEACHER or SUPER_ADMIN
- Never show course sig column for UNIVERSITY_ADMIN
- Always validate role in handler, not just UI
- Teacher clearing must check course.teacherId === user.id
