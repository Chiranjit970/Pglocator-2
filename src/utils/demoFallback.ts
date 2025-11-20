import type { UserProfile, UserRole } from '../../src/store/authStore';

// Demo accounts mapping used across the app
export const DEMO_EMAILS: Record<UserRole, { email: string; name: string; password?: string }> = {
  student: { email: 'teststuff677+test@gmail.com', name: 'Demo Student', password: '123456' },
  owner: { email: 'teststuff677+test1@gmail.com', name: 'Demo Owner', password: '123456' },
  admin: { email: 'teststuff677@gmail.com', name: 'Demo Admin', password: 'akash97' },
};

export function getDemoRoleByEmail(email: string): UserRole | null {
  const lower = (email || '').toLowerCase();
  if (lower === DEMO_EMAILS.student.email) return 'student';
  if (lower === DEMO_EMAILS.owner.email) return 'owner';
  if (lower === DEMO_EMAILS.admin.email) return 'admin';
  return null;
}

export function isDemoEmail(email: string): boolean {
  return getDemoRoleByEmail(email) !== null;
}

export function buildDemoProfile(email: string): UserProfile {
  const role = getDemoRoleByEmail(email) as UserRole;
  const meta = role ? DEMO_EMAILS[role] : { name: 'Demo User' };
  return {
    id: `demo-${role || 'user'}-id`,
    email,
    name: meta.name,
    role: (role || 'student') as UserRole,
    verified: role === 'admin' ? true : undefined,
  } as UserProfile;
}