export const USERS = [
  { email: 'admin@finflow.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'viewer@finflow.com', password: 'viewer123', role: 'viewer', name: 'Viewer User' },
  { email: 'demo@finflow.com', password: 'demo123', role: 'admin', name: 'Demo User' },
];

export function validateLogin(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const rawPassword = String(password || '');

  const user = USERS.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === rawPassword
  );

  if (!user) {
    return null;
  }

  return {
    email: user.email,
    role: user.role,
    name: user.name,
  };
}
