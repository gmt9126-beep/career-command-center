import { useEffect, useRef, useState } from 'react';
import { Trash2, Upload, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TagInput from '@/components/TagInput';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const EMPTY = { name: '', link: '', description: '', role: '', tags: [], preview_image_uri: '' };

export default function ProjectFormDialog({ open, onOpenChange, project, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(project ? { ...EMPTY, ...project, tags: project.tags || [] } : EMPTY);
      setError('');
    }
  }, [open, project]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const uploadPreview = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      set('preview_image_uri')(file_uri);
    } catch {
      setError('That image could not be uploaded. Try a smaller file.');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name.trim()) {
      setError('Give the project a name first.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      link: form.link.trim(),
      description: form.description.trim(),
      role: form.role.trim(),
      tags: (form.tags || []).filter(Boolean).slice(0, 3),
      preview_image_uri: form.preview_image_uri || '',
    };
    try {
      if (project?.id) await base44.entities.Project.update(project.id, payload);
      else await base44.entities.Project.create(payload);
      onOpenChange(false);
      onSaved?.();
    } catch (e) {
      setError(e?.message || 'Could not save this project.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!project?.id) return;
    await base44.entities.Project.delete(project.id);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{project?.id ? 'Edit project' : 'Add a project'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Project name</Label>
            <Input
              value={form.name}
              onChange={(e) => {
                set('name')(e.target.value);
                if (error === 'Give the project a name first.') setError('');
              }}
              placeholder="Wayfinding system"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Link</Label>
            <Input value={form.link} onChange={(e) => set('link')(e.target.value)} placeholder="https://…" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Two-sentence description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
              rows={3}
              placeholder="What it was, what you made. Keep it to two sentences."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">My role</Label>
            <Input value={form.role} onChange={(e) => set('role')(e.target.value)} placeholder="Lead content designer" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Tags (up to 3)</Label>
            <TagInput value={form.tags} onChange={set('tags')} placeholder="UX writing, systems, research" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Preview image</Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12.5px] transition-colors hover:bg-secondary disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {form.preview_image_uri ? 'Replace image' : 'Upload image'}
              </button>
              {form.preview_image_uri && (
                <button
                  type="button"
                  onClick={() => set('preview_image_uri')('')}
                  className="text-[12px] text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadPreview(e.target.files?.[0])}
            />
          </div>

          {error && <p className="text-[12px] text-destructive">{error}</p>}
        </div>

        <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row sm:justify-between">
          {project?.id ? (
            <button
              type="button"
              onClick={remove}
              className="inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-[12.5px] text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save project
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}