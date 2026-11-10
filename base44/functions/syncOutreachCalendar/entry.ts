import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { upsertFollowUpEvent, removeFollowUpEvent, wantsCalendarEvent } from '../../shared/googleCalendar.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const outreachId = body?.outreach_id ? String(body.outreach_id) : null;

    let records;
    if (outreachId) {
      const record = await base44.entities.Outreach.get(outreachId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!record) return Response.json({ error: 'Not found' }, { status: 404 });
      records = [record];
    } else {
      const page = await base44.entities.Outreach.list({ sort: '-created_date', limit: 100 });
      records = page.items || [];
    }

    const jobIds = [...new Set(records.map((r) => r.job_id).filter(Boolean))];
    let jobs = [];
    if (jobIds.length) {
      const jobPage = await base44.entities.Job.filter({ id: { $in: jobIds } }, { limit: 100 });
      jobs = jobPage.items || [];
    }
    const jobLabel = (id) => {
      const job = jobs.find((j) => j.id === id);
      return job ? `${job.company} · ${job.role}` : '';
    };

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    const synced = [];
    const cleared = [];
    const failed = [];

    const syncOne = async (record) => {
      try {
        if (!wantsCalendarEvent(record)) {
          if (record.google_event_id) {
            await removeFollowUpEvent(accessToken, record.google_event_id);
            await base44.entities.Outreach.update(record.id, { google_event_id: '', google_synced_at: '' });
            cleared.push(record.id);
          }
          return;
        }
        const eventId = await upsertFollowUpEvent(accessToken, record, jobLabel(record.job_id));
        if (eventId) {
          await base44.entities.Outreach.update(record.id, {
            google_event_id: eventId,
            google_synced_at: new Date().toISOString(),
          });
          synced.push(record.id);
        }
      } catch (error) {
        failed.push({ id: record.id, error: error.message });
      }
    };

    for (let i = 0; i < records.length; i += 5) {
      await Promise.all(records.slice(i, i + 5).map(syncOne));
    }

    return Response.json({
      synced: synced.length,
      cleared: cleared.length,
      failed,
      scanned: records.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}