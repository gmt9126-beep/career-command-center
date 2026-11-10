import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const wrapLabel = (text, max) => {
  const words = String(text || '').split(' ').filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= max || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, 2);
};

const Tick = ({ x, y, cx, payload }) => {
  const lines = wrapLabel(payload?.value, 11);
  const anchor = cx == null ? 'middle' : x > cx + 2 ? 'start' : x < cx - 2 ? 'end' : 'middle';
  return (
    <text x={x} y={y} textAnchor={anchor} fill="hsl(240 6% 42%)" fontSize={9.5}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 10}>
          {line}
        </tspan>
      ))}
    </text>
  );
};

export default function SkillRadar({ skills = [] }) {
  const data = skills.map((s) => ({
    skill: s.skill,
    score: Math.max(0, Math.min(5, Number(s.score) || 0)),
  }));

  if (!data.length) return null;

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="62%" margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
          <PolarGrid stroke="hsl(230 8% 91%)" />
          <PolarAngleAxis dataKey="skill" tick={<Tick />} tickLine={false} />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} tickCount={6} />
          <Radar
            dataKey="score"
            stroke="hsl(165 30% 34%)"
            fill="hsl(165 30% 34%)"
            fillOpacity={0.18}
            strokeWidth={2}
            dot={{ r: 3, fill: 'hsl(165 30% 34%)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}