import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { loadProjects, formatProjects } from '../../shared/portfolio.ts';
import { SKILL_SCHEMA, SCORING_RULES, formatProfile, normalizeAssessment } from '../../shared/scoring.ts';

const SCHEMA = {
  type: 'object',
  properties: {
    fit_score: { type: 'number' },
    fit_reason: { type: 'string' },
    skill_scores: SKILL_SCHEMA,
    skill_gaps: { type: 'array', items: { type: 'string' } },
    tailored_resume_bullets: { type: 'array', items: { type: 'string' } },
  },
  required: ['fit_score', 'fit_reason', 'skill_scores', 'skill_gaps', 'tailored_resume_bullets'],
};

const buildPrompt = (profile, job, projects) => `You are Career Coach scoring ONE role for a job seeker. Judge fit against their real background only.

PROFILE
${formatProfile(profile)}

PORTFOLIO PROJECTS (real shipped work — usable as evidence)
${formatProjects(projects)}

ROLE
Company: ${job.company}
Title: ${job.role}
Employment type: ${job.employment_type || 'unknown'}
Salary: ${job.salary || 'undisclosed'}
Their notes: ${job.notes || 'none'}
Job description: ${job.job_description || 'NOT SAVED — this role was imported from a tracking sheet, so judge it from the title, company, seniority implied by the title, salary band and notes. Do not invent requirements.'}

SCORING RULES
${SCORING_RULES}

Return only the JSON object.`;

const scoreOne = async (base44, profile, job, projects) => {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: buildPrompt(profile, job, projects),
    response_json_schema: SCHEMA,
  });

  const raw = typeof result === 'string' ? JSON.parse(result) : result;
  const patch = normalizeAssessment(raw);
  if (raw?.fit_reason) patch.fit_reason = String(raw.fit_reason).slice(0, 400);

  await base44.entities.Job.update(job.id, patch);
  return { id: job.id, company: job.company, role: job.role, fit_score: patch.fit_score };
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const jobIds = Array.isArray(body.job_ids) ? body.job_ids.filter((v) => typeof v === 'string').slice(0, 6) : [];
    if (!jobIds.length) return Response.json({ error: 'job_ids is required' }, { status: 400 });

    const profiles = await base44.entities.Profile.list('-created_date', 1);
    const profile = Array.isArray(profiles) ? profiles[0] : profiles?.items?.[0];
    if (!profile) return Response.json({ error: 'Add your profile before scoring roles' }, { status: 400 });
    if (!profile.resume_text) return Response.json({ error: 'Add your resume text before scoring roles' }, { status: 400 });

    const projects = await loadProjects(base44);

    const jobs = await base44.entities.Job.filter({ id: { $in: jobIds } });
    const jobList = Array.isArray(jobs) ? jobs : jobs?.items || [];
    if (!jobList.length) return Response.json({ error: 'No matching roles' }, { status: 404 });

    const scored = [];
    const failed = [];

    for (let i = 0; i < jobList.length; i += 3) {
      const batch = jobList.slice(i, i + 3);
      const results = await Promise.allSettled(batch.map((job) => scoreOne(base44, profile, job, projects)));
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') scored.push(r.value);
        else failed.push({ id: batch[idx].id, error: r.reason?.message || 'scoring failed' });
      });
    }

    return Response.json({ scored, failed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}