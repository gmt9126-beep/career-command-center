import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_PICKS = 5;

const FALLBACK_SOURCES = [
  { name: 'Anthropic', careers_url: 'https://www.anthropic.com/careers' },
  { name: 'OpenAI', careers_url: 'https://openai.com/careers' },
  { name: 'Figma', careers_url: 'https://www.figma.com/careers' },
  { name: 'Adobe', careers_url: 'https://careers.adobe.com/us/en' },
  { name: 'Google', careers_url: 'https://www.google.com/about/careers/applications/jobs/results' },
  { name: 'Microsoft', careers_url: 'https://jobs.careers.microsoft.com/global/en/search' },
  { name: 'Canva', careers_url: 'https://www.lifeatcanva.com/en/jobs' },
  { name: 'Runway', careers_url: 'https://runwayml.com/careers' },
];

const SCHEMA = {
  type: 'object',
  properties: {
    picks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          title: { type: 'string' },
          track: { type: 'string' },
          location: { type: 'string' },
          salary: { type: 'string' },
          employment_type: { type: 'string' },
          link: { type: 'string' },
          source_name: { type: 'string' },
          fit_score: { type: 'integer' },
          fit_reason: { type: 'string' },
        },
        required: ['company', 'title', 'track', 'location', 'link', 'source_name', 'fit_score', 'fit_reason'],
      },
    },
  },
  required: ['picks'],
};

const trackBlock = `- UX design: product/UX designer, content designer, UX writer, design systems, interaction designer.
- Content and graphic design: content designer, copywriter, brand or graphic designer, art director, editorial designer.
- AI prototyping: AI prototyper, prototyping designer, design technologist, AI experience designer, creative technologist — design-side roles that prototype with AI tools, not engineering roles.`;

const buildPrompt = (profile, sources, existing, today) => `You are a job-search researcher working through official employer career sites. Today is ${today}.

SEARCH THESE OFFICIAL CAREER SITES ONLY — never LinkedIn, Indeed, Glassdoor, Handshake or any aggregator:
${sources.map((s, i) => `${i + 1}. ${s.name} — ${s.careers_url}`).join('\n')}

Find currently open roles on those employer sites in these tracks:
${trackBlock}

CANDIDATE
Target roles: ${(profile?.target_roles || []).join(', ') || 'UX Designer, Content Designer'}
Skills: ${(profile?.skills || []).join(', ') || 'not listed'}
Preferred locations: ${(profile?.preferred_locations || []).join(', ') || 'open to remote'}
Preferred industries: ${(profile?.preferred_industries || []).join(', ') || 'not specified'}
Work style: ${profile?.work_style || 'not specified'}
Resume summary: ${(profile?.resume_text || 'not provided').slice(0, 1400)}

ALREADY TRACKED (never return these):
${existing.length ? existing.map((e) => `- ${e}`).join('\n') : '- none yet'}

RULES
- Only real, currently open postings found on the employer career sites above. Never invent a company, title or URL.
- link: the direct posting URL when it appeared in results; otherwise that employer's careers page URL. Never fabricate a URL.
- fit_score: integer 0-100 comparing the role's requirements to the candidate's real background.
- fit_reason: ONE sentence, max 22 words, naming the concrete overlap (skills, track, industry, location). No invented experience.
- location: city and work mode as posted, or "Not listed".
- salary: the posted range, or "Not listed".
- employment_type: "Full-Time" or "Part-Time".
- source_name: which employer site you found it on.
- Prefer postings from the last 45 days.
- At most 2 roles from any one company; spread picks across as many of the sources as possible.
- Return the ${MAX_PICKS} strongest matches, best fit first. Return fewer if nothing real matches.

Return only the JSON object.`;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

    const [profilePage, sourcePage, jobPage] = await Promise.all([
      base44.entities.Profile.list({ sort: '-created_date', limit: 1 }),
      base44.entities.JobSource.list({ sort: 'created_date', limit: 30 }),
      base44.entities.Job.list({ sort: '-created_date', limit: 300 }),
    ]);

    const profile = (profilePage?.items || profilePage || [])[0] || null;
    const savedSources = (sourcePage?.items || sourcePage || []).filter((s) => s.enabled !== false);
    const sources = (savedSources.length ? savedSources : FALLBACK_SOURCES).slice(0, 12);
    const existingJobs = jobPage?.items || jobPage || [];
    const existingKeys = new Set(
      existingJobs.map((j) => `${String(j.company || '').trim().toLowerCase()}|${String(j.role || '').trim().toLowerCase()}`),
    );
    const existingLabels = existingJobs
      .slice(0, 80)
      .map((j) => `${j.company} — ${j.role}`);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: buildPrompt(profile, sources, existingLabels, today),
      add_context_from_internet: true,
      response_json_schema: SCHEMA,
    });

    const raw = typeof result === 'string' ? JSON.parse(result) : result;
    const picks = (raw?.picks || [])
      .filter((p) => p && p.company && p.title)
      .map((p) => ({
        company: String(p.company).trim(),
        role: String(p.title).trim(),
        track: String(p.track || '').trim(),
        location: p.location && p.location !== 'Not listed' ? String(p.location).trim() : '',
        salary: p.salary && p.salary !== 'Not listed' ? String(p.salary).trim() : '',
        employment_type: p.employment_type === 'Part-Time' ? 'Part-Time' : 'Full-Time',
        link: /^https?:\/\//i.test(p.link || '') ? p.link : '',
        sourceName: String(p.source_name || '').trim(),
        fit_score: Math.max(0, Math.min(100, Math.round(Number(p.fit_score) || 0))),
        fit_reason: String(p.fit_reason || '').trim(),
      }))
      .filter((p) => !existingKeys.has(`${p.company.toLowerCase()}|${p.role.toLowerCase()}`))
      .slice(0, MAX_PICKS);

    const created = [];
    for (const pick of picks) {
      const record = await base44.entities.Job.create({
        company: pick.company,
        role: pick.role,
        location: pick.location,
        link: pick.link,
        salary: pick.salary,
        employment_type: pick.employment_type,
        source: 'Company',
        status: 'Recommended',
        fit_score: pick.fit_score,
        fit_reason: pick.fit_reason,
        pick_date: today,
        notes: `Daily pick${pick.track ? ` · ${pick.track}` : ''}${pick.sourceName ? ` · found on ${pick.sourceName} careers site` : ''}`,
      });
      created.push(record);
    }

    return Response.json({ created: created.length, picks: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}