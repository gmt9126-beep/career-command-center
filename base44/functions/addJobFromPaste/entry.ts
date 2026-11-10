import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { loadProjects, formatProjects } from '../../shared/portfolio.ts';
import { SKILL_SCHEMA, SCORING_RULES, formatProfile, normalizeAssessment } from '../../shared/scoring.ts';

const SCHEMA = {
  type: 'object',
  properties: {
    readable: { type: 'boolean' },
    company: { type: 'string' },
    role: { type: 'string' },
    location: { type: 'string' },
    salary: { type: 'string' },
    employment_type: { type: 'string' },
    job_description: { type: 'string' },
    fit_score: { type: 'number' },
    fit_reason: { type: 'string' },
    skill_scores: SKILL_SCHEMA,
    skill_gaps: { type: 'array', items: { type: 'string' } },
    tailored_resume_bullets: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'readable',
    'company',
    'role',
    'fit_score',
    'fit_reason',
    'skill_scores',
    'skill_gaps',
    'tailored_resume_bullets',
  ],
};

const buildPrompt = (profile, projects, text, isLink) => `You are Career Coach, turning ONE pasted job posting into a scored role in the job seeker's pipeline.

PROFILE
${formatProfile(profile)}

PORTFOLIO PROJECTS (real shipped work — usable as evidence)
${formatProjects(projects)}

SOURCE — the job seeker pasted the following ${isLink ? 'link. Open that URL and read the actual posting.' : 'job description text.'}
"""
${text}
"""

${
  isLink
    ? 'If that URL is a login wall, a 404, an expired posting, a search results page, or otherwise does not contain a real job posting you can read, set readable to false, leave company and role empty, and stop.'
    : 'If the pasted text is not a real job posting (no company or no job title), set readable to false and stop.'
}

EXTRACTION RULES
- company is the hiring company, never the job board or aggregator. role is the job title exactly as posted. location is the stated city and/or remote policy, or "".
- job_description keeps the posting's real responsibilities and qualifications, condensed to at most 1500 characters. Never invent requirements.
- salary only when the posting states it. employment_type: "Full-Time" or "Part-Time" when stated, otherwise "".

SCORING RULES
${SCORING_RULES}

Return only the JSON object.`;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === 'string' ? body.text.trim().slice(0, 20000) : '';
    if (text.length < 8) {
      return Response.json({ error: 'Paste a job link or the full job description.' }, { status: 400 });
    }

    const profiles = await base44.entities.Profile.list('-created_date', 1);
    const profile = Array.isArray(profiles) ? profiles[0] : profiles?.items?.[0];
    if (!profile) {
      return Response.json({ error: 'Add your profile first — every role is scored against it.' }, { status: 400 });
    }

    const projects = await loadProjects(base44);
    const isLink = /^https?:\/\/\S+$/i.test(text);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: buildPrompt(profile, projects, text, isLink),
      add_context_from_internet: isLink,
      response_json_schema: SCHEMA,
    });

    const raw = typeof result === 'string' ? JSON.parse(result) : result;
    if (!raw?.readable || !String(raw.company || '').trim() || !String(raw.role || '').trim()) {
      return Response.json({ needsText: true, reason: isLink ? 'link_unreadable' : 'not_a_posting' });
    }

    const payload = {
      company: String(raw.company).trim(),
      role: String(raw.role).trim(),
      location: String(raw.location || '').trim(),
      link: isLink ? text : '',
      job_description: String(raw.job_description || '').slice(0, 4000),
      status: 'Recommended',
      date_added: new Date().toISOString().slice(0, 10),
      ...normalizeAssessment(raw),
    };

    const salary = String(raw.salary || '').trim();
    if (salary) payload.salary = salary;
    if (/part/i.test(raw.employment_type || '')) payload.employment_type = 'Part-Time';
    else if (/full/i.test(raw.employment_type || '')) payload.employment_type = 'Full-Time';
    if (raw.fit_reason) payload.fit_reason = String(raw.fit_reason).slice(0, 400);

    const job = await base44.entities.Job.create(payload);
    return Response.json({ job });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}