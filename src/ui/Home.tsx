import { useState } from 'preact/hooks';
import { debates, importFileText, saveSettings, settings, showToast } from '../app/service';
import { debateHref, go } from '../app/router';
import { ago, fmtNum, listNames, t } from '../i18n';
import { obligationOf } from '../model/derive';
import { parseLink } from '../sync/links';
import { errorText } from './LinkHandler';
import { Icon, readFileText, TopBar } from './common';

export function Home() {
  const [paste, setPaste] = useState('');
  const list = debates.value;
  const s = settings.value;
  const openPasted = () => {
    const p = parseLink(paste);
    if (!p) { showToast(t('home.pasteBad')); return; }
    go(paste.slice(paste.indexOf('#')));
  };
  const importFile = async () => {
    const text = await readFileText('.txt,text/plain');
    if (!text) return;
    try { const r = await importFileText(text); showToast(t('sync.imported', { n: r.added })); go(debateHref(r.debateId)); }
    catch (e) { showToast(errorText((e as Error).message)); }
  };
  return (
    <div class="page">
      <TopBar title={t('app.name')} />
      <main class="content">
        <p class="tagline">{t('app.tagline')}</p>
        <a class="btn primary block" href="#/new"><Icon name="plus" />{t('home.new')}</a>

        <section class="card-list" aria-label={t('home.title')}>
          <h2 class="section-title">{t('home.title')}</h2>
          {list.length === 0 && <div class="empty"><p>{t('home.empty')}</p><p class="muted">{t('home.emptyHint')}</p></div>}
          {list.map(({ record, state }, i) => {
            const me = record.identity && state.people.has(record.identity.personId) ? record.identity.personId : null;
            const ob = me ? obligationOf(state, me) : null;
            const names = listNames([...state.people.values()].map((p) => p.name));
            return (
              <a class="debate-item" href={debateHref(record.id)} key={record.id}>
                <div class="debate-item-title" dir="auto">{s.hideTitles ? t('home.hiddenTitle', { n: i + 1 }) : (state.title || record.title || '—')}</div>
                <div class="muted small" dir="auto">{names}</div>
                <div class="debate-item-meta">
                  {ob && ob.owes.length > 0 && <span class="pill pill-owe">{t('debate.youOwe')}: {fmtNum(ob.owes.length)}</span>}
                  {ob && ob.yourMove.length > 0 && <span class="pill pill-move">{t('debate.yourMove')}: {fmtNum(ob.yourMove.length)}</span>}
                  <span class="muted small">{t('home.lastActivity', { t: ago(record.updatedAt) })}</span>
                </div>
              </a>
            );
          })}
        </section>

        <section class="panel">
          <label class="label" for="paste">{t('home.paste')}</label>
          <div class="row">
            <input id="paste" class="input" dir="ltr" placeholder={t('home.pastePlaceholder')} value={paste}
              onInput={(e) => setPaste((e.target as HTMLInputElement).value)} />
            <button type="button" class="btn" onClick={openPasted} disabled={!paste.trim()}>{t('home.pasteGo')}</button>
          </div>
          <button type="button" class="btn ghost block" onClick={importFile}>{t('home.import')}</button>
        </section>

        <section class="panel">
          <h2 class="section-title">{t('home.settings')}</h2>
          <div class="row wrap">
            <span class="label">{t('settings.lang')}</span>
            <button type="button" class={`btn small ${s.lang === 'ar' ? 'selected' : ''}`} aria-pressed={s.lang === 'ar'} onClick={() => saveSettings({ lang: 'ar' })}>{t('settings.langAr')}</button>
            <button type="button" class={`btn small ${s.lang === 'en' ? 'selected' : ''}`} aria-pressed={s.lang === 'en'} onClick={() => saveSettings({ lang: 'en' })}>{t('settings.langEn')}</button>
          </div>
          {s.lang === 'ar' && (
            <div class="row wrap">
              <span class="label">{t('settings.digits')}</span>
              <button type="button" class={`btn small ${s.digits === 'arab' ? 'selected' : ''}`} aria-pressed={s.digits === 'arab'} onClick={() => saveSettings({ digits: 'arab' })}>{t('settings.digitsArab')}</button>
              <button type="button" class={`btn small ${s.digits === 'latn' ? 'selected' : ''}`} aria-pressed={s.digits === 'latn'} onClick={() => saveSettings({ digits: 'latn' })}>{t('settings.digitsLatn')}</button>
            </div>
          )}
          <label class="check"><input type="checkbox" checked={s.hideTitles} onChange={(e) => saveSettings({ hideTitles: (e.target as HTMLInputElement).checked })} /> {t('settings.hideTitles')}</label>
        </section>

        <nav class="footer-links">
          <a href="#/guide">{t('home.guide')}</a>
          <a href="#/about">{t('home.about')}</a>
        </nav>
      </main>
    </div>
  );
}
