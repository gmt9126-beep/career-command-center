export const JOB_STATUSES = ['Recommended', 'Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

export const STATUS_META = {
  Recommended: { hex: '#6C5CA8', soft: 'hsl(262 32% 52% / 0.10)' },
  Saved: { hex: '#5A6472', soft: 'hsl(218 12% 40% / 0.09)' },
  Applied: { hex: '#2F6F79', soft: 'hsl(190 44% 33% / 0.10)' },
  Interviewing: { hex: '#BE7A2C', soft: 'hsl(32 74% 46% / 0.12)' },
  Offer: { hex: '#2F7A5E', soft: 'hsl(160 40% 33% / 0.12)' },
  Rejected: { hex: '#A4544F', soft: 'hsl(4 44% 46% / 0.10)' },
};

export const OUTREACH_PLATFORMS = ['LinkedIn', 'NYU Violet Network', 'Email'];
export const OUTREACH_STATUSES = ['Draft', 'Sent', 'Replied'];

export const OUTREACH_META = {
  Draft: { hex: '#5A6472', soft: 'hsl(218 12% 40% / 0.09)' },
  Sent: { hex: '#2F6F79', soft: 'hsl(190 44% 33% / 0.10)' },
  Replied: { hex: '#2F7A5E', soft: 'hsl(160 40% 33% / 0.12)' },
};

export const SKILL_LIBRARY = [
  'Design Craft',
  'Communication',
  'Problem Solving',
  'Technical Depth',
  'Systems Thinking',
  'Research & Synthesis',
  'Content Strategy',
];

export const unwrap = (res) => (Array.isArray(res) ? res : res?.items ?? []);

export const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};