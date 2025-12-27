export const ROLE_LABELS = {
  superadmin: 'Super Admin',
  gymowner: 'Club owner',
  owner: 'Club owner',
  staff: 'Staff',
  trainer: 'Trainer',
};

export function getRoleLabel(role) {
  if (!role) return '';
  return ROLE_LABELS[role] || role.charAt(0).toUpperCase() + role.slice(1);
}
