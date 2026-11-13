import { useState } from 'preact/hooks';
import { createDebate, showToast } from '../app/service';
import { debateHref, go } from '../app/router';
import { t } from '../i18n';
import type { SyncMode } from '../store/db';
import { TopBar } from './common';

export function SyncChoice({ value, onChange }: { value: SyncMode; onChange: (m: SyncMode) => void }) {
  return (
    <fieldset class="choice">
      <legend class="label">{t('new.syncTitle')}</legend>
      <label class={`option ${value === 'relay' ? 'checked' : ''}`}>
        <input type="radio" name="sync" checked={value === 'relay'} onChange={() => onChange('relay')} />
        <span><strong>{t('new.syncRelay')}</strong><span class="muted small block-text">{t('new.syncRelayDesc')}</span></span>
      </label>
      <label class={`option ${value === 'manual' ? 'checked' : ''}`}>
        <input type="radio" name="sync" checked={value === 'manual'} onChange={() => onChange('manual')} />
        <span><strong>{t('new.syncManual')}</strong><span class="muted small block-text">{t('new.syncManualDesc')}</span></span>
      </label>
    </fieldset>
  );
}

export function NewDebate() {
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [standpoint, setStandpoint] = useState('');
  const [sync, setSync] = useState<SyncMode>('relay');
  const [busy, setBusy] = useState(false);
  const ok = title.trim() && name.trim() && standpoint.trim();
  const submit = async (e: Event) => {
    e.preventDefault(); if (!ok || busy) return;
    setBusy(true);
    try { const id = await createDebate({ title, name, standpoint, syncMode: sync }); go(debateHref(id, 'sync') + '?invite=1', true); }
    catch (err) { showToast(t('common.error', { msg: (err as Error).message })); setBusy(false); }
  };
  return (
    <div class="page">
      <TopBar title={t('new.title')} back="#/" />
      <main class="content">
        <form onSubmit={submit} class="form">
          <label class="label" for="nt">{t('new.debateTitle')}</label>
          <input id="nt" class="input" dir="auto" maxLength={200} placeholder={t('new.debateTitlePh')} value={title} onInput={(e) => setTitle((e.target as HTMLInputElement).value)} />
          <label class="label" for="nn">{t('new.name')}</label>
          <input id="nn" class="input" dir="auto" maxLength={40} autoComplete="nickname" value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} />
          <label class="label" for="ns">{t('new.standpoint')}</label>
          <textarea id="ns" class="input" dir="auto" rows={3} maxLength={5000} placeholder={t('new.standpointPh')} value={standpoint} onInput={(e) => setStandpoint((e.target as HTMLTextAreaElement).value)} />
          <SyncChoice value={sync} onChange={setSync} />
          <button type="submit" class="btn primary block" disabled={!ok || busy}>{t('new.create')}</button>
        </form>
      </main>
    </div>
  );
}
