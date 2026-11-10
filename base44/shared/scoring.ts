export const SKILL_ORDER = [
  'Design Craft',
  'Communication',
  'Problem Solving',
  'Technical Depth',
  'Systems Thinking',
  'Research & Synthesis',
  'Content Strategy',
];

export const SKILL_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      skill: { type: 'string' },
      score: { type: 'number' },
      note: { type: 'string' },
    },
    required: ['skill', 'score', 'note'],
  },
};

export const formatProfile = (profile) => {
  const p = profile || {};
  return [
    `Name: ${p.name || 'not provided'}`,
    `Target roles: ${(p.target_roles || []).join(', ') || 'Content Designer, UX Designer'}`,
    `Preferred locations: ${(p.preferred_locations || []).join(', ') || 'not specified'}`,
    `Preferred industries: ${(p.preferred_industries || []).join(', ') || 'not specified'}`,
    `Work style: ${p.work_style || 'not specified'}`,
    'Resume and experience (single source of truth):',
    p.resume_text || 'not provided',
  ].join('\n');
};

export const SCORING_RULES = `- fit_score is 0-100 and must be honest: 85+ only when level, domain and craft clearly match; 60-84 is a stretch worth taking; below 60 means the gap is real. Seniority counts: Staff, Head-of or Director expectations should score below junior and mid roles when the resume shows internships and early-career work.
- fit_reason is one plain sentence explaining the score.
- skill_scores: score exactly these seven skills, 1-5, in this exact order and spelling: ${SKILL_ORDER.join(', ')}. Each note is one short sentence citing evidence from the resume or portfolio only.
- skill_gaps: 2 to 4 honest gaps, no softening.
- tailored_resume_bullets: exactly 3 bullets, first person, using only employers, tools, outcomes and portfolio projects that appear in the profile and portfolio. A project may be named when it proves a requirement. Never invent metrics, titles, years, employers or projects.`;

export const normalizeAssessment = (raw) => {
  const bySkill = new Map((raw?.skill_scores || []).map((s) => [String(s.skill).trim().toLowerCase(), s]));
  const skill_scores = SKILL_ORDER.map((skill) => {
    const hit = bySkill.get(skill.toLowerCase());
    return {
      skill,
      score: Math.max(1, Math.min(5, Number(hit?.score) || 0)) || 1,
      note: hit?.note || '',
    };
  });

  return {
    fit_score: Math.max(0, Math.min(100, Math.round(Number(raw?.fit_score) || 0))),
    skill_scores,
    skill_gaps: (raw?.skill_gaps || []).slice(0, 5),
    tailored_resume_bullets: (raw?.tailored_resume_bullets || []).slice(0, 3),
  };
};