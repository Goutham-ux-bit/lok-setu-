const CATEGORY_ICONS = {
  street_light: '💡', road_damage: '🚧', water_supply: '💧',
  sewage: '🚰', electricity: '⚡', other: '❓'
};
const CATEGORY_LABELS = {
  street_light: 'Street Light', road_damage: 'Road Damage', water_supply: 'Water Supply',
  sewage: 'Sewage', electricity: 'Electricity', other: 'Other'
};
const STATUS_LABELS = { pending: 'Pending', in_progress: 'In progress', resolved: 'Resolved' };

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(`${iso}Z`).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(`${iso}Z`).toLocaleDateString();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}
