import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { loadProjects, formatProjects } from '../../shared/portfolio.ts';

const SCHEMA = {
  type: 'object',
  properties: {
    contact_name: { type: 'string' },
    contact_title: { type: 'string' },
    platform: { type: 'string' },
    common_points: { type: 'array', items: { type: 'string' } },
    message: { type: 'string' },
    follow_up_days: { type: 'number' },
  },
  required: ['contact_name', 'platform', 'common_points', 'message'],
};

const buildPrompt = (profile, job, background, projects) => `You are Career Coach, writing ONE outreach message for a job seeker.

CANDIDATE
Name: ${profile?.name || 'the candidate'}
Target roles: ${(profile?.target_roles || []).join(', ') || 'not specified'}
Skills: ${(profile?.skills || []).join(', ') || 'not specified'}
Work style: ${profile?.work_style || 'not specified'}
Resume and experience (the only source of truth about the candidate):
${(profile?.resume_text || 'not provided').slice(0, 4000)}

THEIR PORTFOLIO PROJECTS (real shipped work — the only projects you may mention)
${formatProjects(projects)}

ROLE THEY WANT
Company: ${job.company}
Title: ${job.role}
Location: ${job.location || 'not listed'}
Description: ${(job.job_description || 'not saved').slice(0, 1200)}

PERSON AND BACKGROUND (pasted by the candidate)
${background}

WHAT TO DO
- Find 1 or 2 GENUINE common points between the candidate and this person or this team: shared school, shared employer, same craft, overlapping project type, or a stated interest that appears in BOTH the candidate's background and the pasted text. Return them in common_points as short factual sentences naming the source of the overlap.
- If only one real point exists, return one. If the pasted text is thin, rely on the overlap between the candidate's craft and the person's role. Never invent a connection, mutual contact, employer, metric or title.
- When it makes the overlap concrete, name ONE of the candidate's portfolio projects above (with what they did on it) — only if it is relevant to this team's work and appears in that list.
- message: under 200 words, first person, plain text, no subject line, no bullets, no greeting boilerplate like "I hope this finds you well". Open with the specific common ground, give one concrete reason you are reaching out to this team, and close with a low-pressure ask (a question or 15 minutes).
- contact_name: the person's name if the pasted text contains one, otherwise "Hiring team". contact_title: their title if visible, otherwise an empty string.
- platform: "LinkedIn" unless the pasted text clearly points to email, then "Email"; "NYU Violet Network" when the only connection is the NYU network.
- follow_up_days: a whole number from 3 to 6 — how many days until a follow-up makes sense.

Return only the JSON object.`;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const jobId = typeof body.job_id === 'string' ? body.job_id : '';
    const background = typeof body.background === 'string' ? body.background.trim().slice(0, 8000) : '';

    if (!jobId) return Response.json({ error: 'job_id is required' }, { status: 400 });
    if (background.length < 20) {
      return Response.json({ error: 'Paste a bit more about the person first.' }, { status: 400 });
    }

    const job = await base44.entities.Job.get(jobId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!job) return Response.json({ error: 'That role is no longer on your board.' }, { status: 404 });

    const profiles = await base44.entities.Profile.list('-created_date', 1);
    const profile = Array.isArray(profiles) ? profiles[0] : profiles?.items?.[0];
    const projects = await loadProjects(base44);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: buildPrompt(profile, job, background, projects),
      response_json_schema: SCHEMA,
    });

    const raw = typeof result === 'string' ? JSON.parse(result) : result;

    const words = String(raw?.message || '').split(/\s+/).filter(Boolean);
    if (!words.length) return Response.json({ error: 'The coach returned an empty draft. Try again.' }, { status: 502 });
    const message = words.length > 200 ? words.slice(0, 200).join(' ') : words.join(' ');

    const rawPlatform = String(raw?.platform || 'LinkedIn');
    const platform = /nyu/i.test(rawPlatform)
      ? 'NYU Violet Network'
      : /email|gmail|outlook/i.test(rawPlatform)
        ? 'Email'
        : 'LinkedIn';

    const days = Math.min(14, Math.max(2, Math.round(Number(raw?.follow_up_days) || 4)));
    const followUp = new Date();
    followUp.setDate(followUp.getDate() + days);

    const outreach = await base44.entities.Outreach.create({
      job_id: jobId,
      contact_name: String(raw?.contact_name || '').trim() || 'Hiring team',
      contact_title: String(raw?.contact_title || '').trim(),
      platform,
      status: 'Draft',
      message_draft: message,
      follow_up_date: followUp.toISOString().slice(0, 10),
    });

    const common_points = (raw?.common_points || [])
      .filter((p) => typeof p === 'string' && p.trim())
      .slice(0, 2)
      .map((p) => p.trim());

    return Response.json({ outreach, common_points });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}