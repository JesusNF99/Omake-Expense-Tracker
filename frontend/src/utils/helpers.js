export const NEON_COLORS = ['#06b6d4', '#c084fc', '#f472b6', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#f59e0b', '#ef4444']; // Extended neon palette

export const getColorForCategory = (categoryString) => {
  if (!categoryString) return NEON_COLORS[0];
  let sum = 0;
  for (let i = 0; i < categoryString.length; i++) {
    sum += categoryString.charCodeAt(i) * (i + 1);
  }
  return NEON_COLORS[sum % NEON_COLORS.length];
};
