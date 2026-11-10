export const PROJECT_LIMIT = 12;

export async function loadProjects(base44) {
  const page = await base44.entities.Project.list({ sort: '-updated_date', limit: PROJECT_LIMIT });
  return page?.items || page || [];
}

export const formatProjects = (projects = []) => {
  if (!projects.length) return 'none added yet';
  return projects
    .map((p, i) => {
      const head = `${i + 1}. ${p.name}${p.role ? ` — the candidate's role: ${p.role}` : ''}`;
      const body = (p.description || '').trim();
      const tags = p.tags?.length ? `Tags: ${p.tags.join(', ')}` : '';
      return [head, body, tags].filter(Boolean).join('\n   ');
    })
    .join('\n');
};