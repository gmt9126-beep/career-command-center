import { formatDate } from '@/lib/constants';

export const EMPTY_FILTERS = { keywords: '', company: '', status: '', date: '', fit: '' };

export const hasFilters = (filters) =>
  Object.values(filters || {}).some((value) => String(value || '').trim());

const matchFit = (score, raw) => {
  const text = String(raw)
    .replace(/\s+/g, '')
    .replace(/≥/g, '>=')
    .replace(/^(\d+)\+$/, '>=$1');
  const range = text.match(/^(\d+)-(\d+)$/);
  if (range) return score >= Number(range[1]) && score <= Number(range[2]);
  const compare = text.match(/^(>=|<=|>|<)?(\d+)$/);
  if (!compare) return true;
  const value = Number(compare[2]);
  if (compare[1] === '>') return score > value;
  if (compare[1] === '<') return score < value;
  if (compare[1] === '<=') return score <= value;
  return score >= value;
};

export function filterJobs(jobs, filters) {
  const words = filters.keywords.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const company = filters.company.trim().toLowerCase();
  const status = filters.status.trim().toLowerCase();
  const date = filters.date.trim().toLowerCase();
  const fit = filters.fit.trim();

  return jobs.filter((job) => {
    if (company && !String(job.company || '').toLowerCase().includes(company)) return false;
    if (status && !String(job.status || '').toLowerCase().includes(status)) return false;
    if (date) {
      const when = `${job.date_added || ''} ${formatDate(job.date_added)}`.toLowerCase();
      if (!when.includes(date)) return false;
    }
    if (fit && !matchFit(Number(job.fit_score) || 0, fit)) return false;
    if (words.length) {
      const haystack = [
        job.role,
        job.company,
        job.status,
        job.location,
        job.fit_reason,
        job.job_description,
        job.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!words.every((word) => haystack.includes(word))) return false;
    }
    return true;
  });
}