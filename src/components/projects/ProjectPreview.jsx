import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';

const domainOf = (link) => {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

export default function ProjectPreview({ project }) {
  const [url, setUrl] = useState(null);
  const uri = project.preview_image_uri;

  useEffect(() => {
    let alive = true;
    setUrl(null);
    if (!uri) return undefined;
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri })
      .then((res) => {
        if (alive) setUrl(res?.signed_url || null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [uri]);

  if (url) {
    return (
      <div className="h-full w-full overflow-hidden rounded-xl bg-secondary/60">
        <Image src={url} alt={`${project.name} preview`} className="h-full w-full object-cover" fittingType="fill" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-xl border border-border/70 bg-secondary/50 p-4">
      <span className="font-heading text-[34px] leading-none tracking-[-0.04em] text-muted-foreground/45">
        {initials(project.name) || '—'}
      </span>
      <span className="truncate font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
        {domainOf(project.link) || 'No preview'}
      </span>
    </div>
  );
}