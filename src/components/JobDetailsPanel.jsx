const longDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function JobDetailsPanel({ job }) {
  const rows = [
    ['Applied', longDate(job.date_added)],
    ['Posted', longDate(job.date_posted)],
    ['Salary', job.salary],
    ['Type', job.employment_type],
    ['Source', [job.source, job.applied_via && `via ${job.applied_via}`].filter(Boolean).join(' ')],
    ['Contact', job.contact_name],
    ['Reply', job.reply_received ? 'Received' : ''],
    ['Outreach', [job.linkedin_dm && 'LinkedIn DM', job.sent_email && 'Email'].filter(Boolean).join(' · ')],
  ].filter(([, value]) => value);

  if (!rows.length) return null;

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5">
      <h2 className="text-[16px]">Application details</h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-[13px] leading-snug">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}