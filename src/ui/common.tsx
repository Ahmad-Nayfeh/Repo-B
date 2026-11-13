import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { t } from '../i18n';
import type { Tone } from './logic';

export function Icon({ name }: { name: Tone | 'back' | 'reply' | 'share' | 'search' | 'up' | 'menu' | 'plus' }) {
  // simple 20px stroke icons; aria-hidden — every icon is paired with a visible text label
  const paths: Record<string, string> = {
    owe: 'M10 3a7 7 0 1 0 0 14a7 7 0 0 0 0-14zm0 3v5m0 3v.5',
    move: 'M4 10h9m-4-4l4 4l-4 4',
    open: 'M10 3a7 7 0 1 0 0 14a7 7 0 0 0 0-14z',
    closed: 'M5 10h10',
    accepted: 'M4 10.5l4 4l8-9',
    neutral: 'M10 9.5v.5',
    gone: 'M5 5l10 10M15 5L5 15',
    back: 'M8 5l5 5l-5 5',
    up: 'M5 12l5-5l5 5',
    reply: 'M8 6L4 10l4 4M4 10h8a4 4 0 0 1 4 4v1',
    share: 'M10 3v9M6 7l4-4l4 4M4 12v4h12v-4',
    search: 'M9 4a5 5 0 1 0 0 10a5 5 0 0 0 0-10zm4 9l3 3',
    menu: 'M4 6h12M4 10h12M4 14h12',
    plus: 'M10 4v12M4 10h12',
  };
  return (
    <svg class={`icon icon-${name}`} viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <path d={paths[name]} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export function StatusChip({ tone, text }: { tone: Tone; text: string }) {
  return <span class={`chip chip-${tone}`}><Icon name={tone} /><span>{text}</span></span>;
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ComponentChildren }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} class="sheet" onClose={onClose} onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div class="sheet-inner">
        <div class="sheet-head">
          <h2>{title}</h2>
          <button type="button" class="btn ghost" onClick={onClose}>{t('common.close')}</button>
        </div>
        {open && children}
      </div>
    </dialog>
  );
}

export function TopBar({ title, back, actions }: { title: string; back?: string; actions?: ComponentChildren }) {
  return (
    <header class="topbar">
      {back !== undefined && <a class="btn ghost icon-btn" href={back} aria-label={t('common.back')}><Icon name="back" /></a>}
      <h1 dir="auto">{title}</h1>
      <div class="topbar-actions">{actions}</div>
    </header>
  );
}

export async function shareOrCopy(o: { title?: string; text?: string; url?: string }): Promise<'shared' | 'copied' | 'failed'> {
  try {
    if (navigator.share) { await navigator.share(o); return 'shared'; }
  } catch (e) { if ((e as DOMException)?.name === 'AbortError') return 'failed'; }
  try {
    await navigator.clipboard.writeText([o.text, o.url].filter(Boolean).join('\n'));
    return 'copied';
  } catch { return 'failed'; }
}

export async function shareFile(name: string, text: string, mime = 'text/plain'): Promise<void> {
  const file = new File([text], name, { type: mime });
  try {
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; }
  } catch (e) { if ((e as DOMException)?.name === 'AbortError') return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

export function readFileText(accept: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = accept;
    input.onchange = async () => { const f = input.files?.[0]; resolve(f ? await f.text() : null); };
    input.click();
  });
}

export function excerpt(s: string, n = 90): string {
  const one = s.replace(/\s+/g, ' ').trim();
  return one.length > n ? one.slice(0, n - 1) + '…' : one;
}
