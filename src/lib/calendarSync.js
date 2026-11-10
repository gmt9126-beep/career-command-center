import { base44 } from '@/api/base44Client';

// Pushes outreach follow-up dates to the connected Google Calendar.
// Pass an outreach id to sync one record, or nothing to sync every follow-up.
export async function syncFollowUps(outreachId) {
  const res = await base44.functions.invoke(
    'syncOutreachCalendar',
    outreachId ? { outreach_id: outreachId } : {}
  );
  return res.data;
}