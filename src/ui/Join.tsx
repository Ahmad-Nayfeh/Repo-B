import { useState } from 'preact/hooks';
import { joinAs, showToast, type Loaded } from '../app/service';
import { debateHref, go } from '../app/router';
import { listNames, t } from '../i18n';
import type { SyncMode } from '../store/db';
import { SyncChoice } from './NewDebate';
import { Charter } from './Static';
import { TopBar } from './common';

export function Join({ l }: { l: Loaded }) {
  const s = l.state;
  const [name, setName] = useState('');
  const [standpoint, setStandpoint] = useState('');
  const [qOnly, setQOnly] = useState(false);
  const [sync, setSync] = useState<SyncMode | null>(null);
  const [busy, setBusy] = useState(false);
  const names = listNames([...s.people.values()].map((p) => p.name));
  const roots = s.roots.map((id) => s.nodes.get(id)!);
  const submit = async (e: Event) => {
    e.preventDefault(); if (!name.trim() || !sync || busy) return;
    setBusy(true);
    try { await joinAs(l.record.id, { name, standpoint: qOnly ? '' : standpoint, questionerOnly: qOnly, syncMode: sync }); go(debateHref(l.record.id) + (sync === 'manual' ? '?joined=1' : ''), true); }
    catch (err) { showToast(t('common.error', { msg: (err as Error).message })); setBusy(false); }
  };
  return (
    <div class="page">
      <TopBar title={t('join.title')} back="#/" />
      <main class="content">
        <h2 class="debate-title" dir="auto">{s.title}</h2>
        {names && <p class="muted">{t('join.between', { names })}</p>}
        <p>{t('join.explain')}</p>
        {roots.length > 0 && (
          <ul class="standpoints">
            {roots.map((n) => <li key={n.id}><strong>{s.people.get(n.authorId)?.name}:</strong> <span dir="auto">{n.text}</span></li>)}
          </ul>
        )}
        <p class="warn small">{t('join.privateWarn')}</p>
        <form onSubmit={submit} class="form">
          <label class="label" for="jn">{t('join.name')}</label>
          <input id="jn" class="input" dir="auto" maxLength={40} autoComplete="nickname" value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} />
          <label class="check"><input type="checkbox" checked={qOnly} onChange={(e) => setQOnly((e.target as HTMLInputElement).checked)} /> {t('join.questionerOnly')}</label>
          {qOnly ? <p class="muted small">{t('join.questionerNote')}</p> : (
            <>
              <label class="label" for="js">{t('join.standpoint')}</label>
              <textarea id="js" class="input" dir="auto" rows={3} maxLength={5000} value={standpoint} onInput={(e) => setStandpoint((e.target as HTMLTextAreaElement).value)} />
            </>
          )}
          <SyncChoice value={sync} onChange={setSync} />
          <p class="muted small">{t('join.existingNote')}</p>
          <button type="submit" class="btn primary block" disabled={!name.trim() || !sync || busy}>{t('join.go')}</button>
          <a class="btn ghost block" href={debateHref(l.record.id)}>{t('join.readOnly')}</a>
        </form>
        <details class="panel"><summary>{t('join.charter')}</summary><Charter /></details>
      </main>
    </div>
  );
}
