const EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

function nextDay(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function shortSummary(record) {
  return `Follow up with ${record.contact_name}${record.contact_title ? ` · ${record.contact_title}` : ''}`;
}

export function followUpEventBody(record, jobLabel = '') {
  if (!record?.follow_up_date) return null;
  const lines = [];
  if (jobLabel) lines.push(`Role: ${jobLabel}`);
  if (record.platform) lines.push(`Channel: ${record.platform}`);
  if (record.contact_title) lines.push(`Title: ${record.contact_title}`);
  if (record.message_draft) lines.push('', 'Your draft:', record.message_draft);
  return {
    summary: shortSummary(record),
    description: lines.join('\n'),
    start: { date: record.follow_up_date },
    end: { date: nextDay(record.follow_up_date) },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 9 * 60 },
        { method: 'popup', minutes: 24 * 60 },
      ],
    },
    extendedProperties: {
      private: { base44_outreach_id: record.id || '' },
    },
  };
}

function fail(res, text) {
  const error = new Error(`Google Calendar refused the request (${res.status}): ${String(text).slice(0, 200)}`);
  error.status = res.status;
  return error;
}

export async function upsertFollowUpEvent(accessToken, record, jobLabel = '') {
  const body = followUpEventBody(record, jobLabel);
  if (!body) return null;

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  if (record.google_event_id) {
    const res = await fetch(`${EVENTS_URL}/${encodeURIComponent(record.google_event_id)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      return data.id || record.google_event_id;
    }
    if (res.status !== 404 && res.status !== 410) {
      throw fail(res, await res.text());
    }
  }

  const res = await fetch(EVENTS_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw fail(res, await res.text());
  const data = await res.json();
  return data.id || null;
}

export async function removeFollowUpEvent(accessToken, eventId) {
  if (!eventId) return;
  const res = await fetch(`${EVENTS_URL}/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw fail(res, await res.text());
  }
}

export function wantsCalendarEvent(record) {
  return Boolean(record?.follow_up_date) && record?.status !== 'Replied';
}