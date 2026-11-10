import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const SCHEMA = {
  type: 'object',
  properties: {
    roles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          title: { type: 'string' },
          location: { type: 'string' },
          salary: { type: 'string' },
          employment_type: { type: 'string' },
          source: { type: 'string' },
          link: { type: 'string' },
          focus_area: { type: 'string' },
          why_fit: { type: 'string' },
          non_technical_note: { type: 'string' },
        },
        required: ['company', 'title', 'location', 'link', 'source', 'focus_area', 'why_fit', 'non_technical_note'],
      },
    },
  },
  required: ['roles'],
};

const buildPrompt = (profile, focus) => `You are a job-search researcher. Find REAL, currently open roles for one candidate using web search. Never invent a posting.

CANDIDATE
Target roles: ${(profile?.target_roles || []).join(', ') || 'Content Designer, UX Designer'}
Skills: ${(profile?.skills || []).join(', ') || 'not listed'}
Preferred locations: ${(profile?.preferred_locations || []).join(', ') || 'open to remote'}
Preferred industries: ${(profile?.preferred_industries || []).join(', ') || 'not specified'}
Work style: ${profile?.work_style || 'not specified'}
Resume summary: ${(profile?.resume_text || 'not provided').slice(0, 1600)}

SEARCH BRIEF
- The candidate wants roles in AI or at AI-forward companies that do NOT require a technical or engineering background.
- Look at job boards and employer sites: LinkedIn, Handshake, Wellfound, Built In, ai-jobs.net, Otta, and company careers pages.
- Suitable role families: content design, UX writing, product or content marketing, brand and communications, program or project management, research or design operations, customer success, solutions consulting, AI trainer or data quality lead, policy and ethics, partnerships, recruiting, community.
- Exclude: software engineering, ML or data science, research scientist, and anything that requires coding, a CS degree or model-building work.
- Vary seniority and company size. Prefer postings from the last 45 days.
${focus ? `- Extra focus for this search: ${focus}.` : ''}

RULES
- Return 6 to 8 roles.
- link: the direct posting URL if it appeared in search results; otherwise the employer's careers page. Never fabricate a URL.
- salary: copy the posted range, or "Not listed".
- employment_type: "Full-Time" or "Part-Time".
- source: where the role was found (LinkedIn, Handshake, Wellfound, Built In, Company site, etc.).
- focus_area: 2-3 words such as "Content & UX", "Marketing & Brand", "Program & Ops", "Research & Policy", "Customer & Solutions".
- why_fit: one sentence connecting the role to the candidate's real background above. No invented experience.
- non_technical_note: one sentence explaining why it does not require a technical background.

Return only the JSON object.`;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const focus = typeof body.focus === 'string' ? body.focus.trim().slice(0, 120) : '';

    const profiles = await base44.entities.Profile.list('-created_date', 1);
    const profile = Array.isArray(profiles) ? profiles[0] : profiles?.items?.[0];

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: buildPrompt(profile, focus),
      add_context_from_internet: true,
      response_json_schema: SCHEMA,
    });

    const raw = typeof result === 'string' ? JSON.parse(result) : result;
    const roles = (raw?.roles || [])
      .filter((r) => r && r.company && r.title)
      .slice(0, 8)
      .map((r) => ({
        company: String(r.company).trim(),
        title: String(r.title).trim(),
        location: r.location ? String(r.location).trim() : 'Not listed',
        salary: r.salary ? String(r.salary).trim() : 'Not listed',
        employment_type: r.employment_type === 'Part-Time' ? 'Part-Time' : 'Full-Time',
        source: r.source ? String(r.source).trim() : 'Web search',
        link: /^https?:\/\//i.test(r.link || '') ? r.link : '',
        focus_area: r.focus_area ? String(r.focus_area).trim() : 'AI',
        why_fit: r.why_fit ? String(r.why_fit).trim() : '',
        non_technical_note: r.non_technical_note ? String(r.non_technical_note).trim() : '',
      }));

    return Response.json({ roles });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}