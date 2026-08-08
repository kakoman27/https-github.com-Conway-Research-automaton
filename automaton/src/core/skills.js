/**
 * Skills: instrucciones cargadas desde skills/*.md (frontmatter: name, description).
 * Se inyectan en el prompt del cerebro LLM y orientan al cerebro reflex.
 */
import fs from 'node:fs';
import path from 'node:path';

export function loadSkills(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];
  const skills = [];
  for (const file of fs.readdirSync(skillsDir).filter((f) => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(skillsDir, file), 'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) continue;
    const meta = Object.fromEntries(
      m[1].split('\n').filter(Boolean).map((l) => {
        const i = l.indexOf(':');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      })
    );
    skills.push({ name: meta.name || file, description: meta.description || '', body: m[2].trim() });
  }
  return skills;
}
