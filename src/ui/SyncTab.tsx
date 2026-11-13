import { useEffect, useState } from 'preact/hooks';
import { backupFile, identityLink, importFileText, inviteLink, makeUpdate, plainExport, removeDebate, setSyncMode, showToast, type Loaded } from '../app/service';
import { go } from '../app/router';
import { ago, t } from '../i18n';
import { relayStatus, syncNow } from '../sync/engine';
import { Icon, readFileText, shareFile, shareOrCopy } from './common';

export function SyncTab({ l }: { l: Loaded }) {
  const r = l.record;
  const [invite, setInvite] = useState<{ url: string; includesSnapshot: boolean } | null>(null);
  const highlightInvite = location.hash.includes('invite=1');
  useEffect(() => { void inviteLink().then(setInvite); }, [l.events.length]);
  const status = relayStatus.value[r.id] ?? [];

  const shareInvite = async () => {
    if (!invite) return;
    const res = await shareOrCopy({ title: l.state.title, text: t('share.message', { title: l.state.title }), url: invite.url });
    if (res === 'copied') showToast(t('common.copied'));
  };
  const sendUpdate = async () => {
    const u = await makeUpdate();
    if (u.url) { const res = await shareOrCopy({ text: t('debate.nudgeText', { title: l.state.title }), url: u.url }); if (res === 'copied') showToast(t('common.copied')); }
    else if (u.file) { showToast(t('sync.tooBigFile')); await shareFile(u.file.name, u.file.text); }
  };
  const backup = async () => { const f = await backupFile(); await shareFile(f.name, f.text); };
  const exportPlain = async () => { if (!confirm(t('sync.exportPlainWarn'))) return; const f = plainExport(); await shareFile(f.name, f.text, 'application/json'); };
  const importF = async () => {
    const text = await readFileText('.txt,.json,text/plain,application/json'); if (!text) return;
    try { const res = await importFileText(text); showToast(t('sync.imported', { n: res.added })); }
    catch (e) { showToast((e as Error).message === 'need_invite' ? t('sync.needInviteFirst') : t('common.error', { msg: (e as Error).message })); }
  };
  const shareIdentity = async () => {
    if (!confirm(t('sync.identityWarn'))) return;
    const url = await identityLink();
    const res = await shareOrCopy({ url }); if (res === 'copied') showToast(t('common.copied'));
  };
  const del = async () => { if (!confirm(t('sync.deleteConfirm'))) return; await removeDebate(r.id); go('#/'); };
  const backupOld = !r.lastBackupAt || Date.now() - r.lastBackupAt > 14 * 86400_000;

  return (
    <>
      <section class={`panel ${highlightInvite ? 'highlight' : ''}`}>
        <h2 class="section-title">{highlightInvite ? t('share.title') : t('sync.invite')}</h2>
        <p class="small">{highlightInvite ? t('share.desc') : t('sync.inviteDesc')}</p>
        {invite && !invite.includesSnapshot && <p class="warn small">{t('share.noSnapshot')}</p>}
        <button type="button" class="btn primary block" onClick={shareInvite} disabled={!invite}><Icon name="share" />{t('share.button')}</button>
      </section>

      <section class="panel">
        <h2 class="section-title">{t('sync.mode')}: {r.syncMode === 'relay' ? t('sync.modeRelay') : t('sync.modeManual')}</h2>
        {r.syncMode === 'relay' ? (
          <>
            <p class="muted small">{t('new.syncRelayDesc')}</p>
            <h3 class="label">{t('sync.relays')}</h3>
            <ul class="plain relays">
              {status.map((x) => (
                <li key={x.url} class="small"><span dir="ltr">{x.url.replace('wss://', '')}</span> — {x.state === 'ok' ? t('sync.relayOk') : x.state === 'down' ? t('sync.relayDown') : t('sync.relayWait')}</li>
              ))}
            </ul>
            <div class="row wrap">
              <button type="button" class="btn" onClick={() => syncNow(r.id)}>{t('sync.syncNow')}</button>
              <button type="button" class="btn ghost" onClick={() => setSyncMode('manual')}>{t('sync.switchToManual')}</button>
            </div>
          </>
        ) : (
          <>
            <p class="muted small">{t('new.syncManualDesc')}</p>
            <button type="button" class="btn ghost" onClick={() => setSyncMode('relay')}>{t('sync.switchToRelay')}</button>
          </>
        )}
      </section>

      <section class="panel">
        <h2 class="section-title">{t('sync.sendUpdate')}</h2>
        <p class="small">{t('sync.sendUpdateDesc')}</p>
        <button type="button" class="btn block" onClick={sendUpdate}><Icon name="share" />{t('debate.sendUpdate')}</button>
      </section>

      <section class="panel">
        <h2 class="section-title">{t('sync.backup')}</h2>
        <p class="small">{t('sync.backupDesc')}</p>
        <p class={`small ${backupOld ? 'warn' : 'muted'}`}>{r.lastBackupAt ? t('sync.lastBackup', { t: ago(r.lastBackupAt) }) : t('sync.neverBackup')}</p>
        <div class="row wrap">
          <button type="button" class="btn" onClick={backup}>{t('sync.backup')}</button>
          <button type="button" class="btn ghost" onClick={importF}>{t('sync.import')}</button>
          <button type="button" class="btn ghost" onClick={exportPlain}>{t('sync.exportPlain')}</button>
        </div>
        <p class="muted small">{t('sync.install')}</p>
      </section>

      {l.me && (
        <section class="panel">
          <h2 class="section-title">{t('sync.identity')}</h2>
          <p class="small">{t('sync.identityDesc')}</p>
          <button type="button" class="btn ghost" onClick={shareIdentity}>{t('sync.identity')}</button>
        </section>
      )}

      <button type="button" class="btn danger ghost block" onClick={del}>{t('sync.delete')}</button>
    </>
  );
}
