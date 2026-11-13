import type { Loaded } from '../app/service';
import { debateHref } from '../app/router';
import { lang, t } from '../i18n';
import { LIBRARY } from '../content/library';
import { StatusChip } from './common';
import { nodeChip, personName } from './logic';

export function TermsTab({ l }: { l: Loaded }) {
  const s = l.state;
  const defs = [...s.nodes.values()].filter((n) => n.move === 'define' && !s.dead.has(n.id)).sort((a, b) => a.at - b.at);
  return (
    <>
      <h2 class="section-title">{t('terms.title')}</h2>
      {defs.length === 0 && <p class="muted">{t('terms.empty')}</p>}
      <ul class="plain">
        {defs.map((n) => {
          const chip = nodeChip(s, n, l.me);
          const agreed = s.assertions.get(n.id)?.status === 'accepted';
          return (
            <li key={n.id} class="card">
              <div class="card-head"><span class={`pill ${agreed ? 'pill-accepted' : 'pill-open'}`}>{agreed ? t('terms.agreed') : t('terms.disputed')}</span><span class="author">{personName(s, n.authorId, l.me)}</span></div>
              <p class="card-text" dir="auto">{n.text}</p>
              <div class="card-foot">{chip && <StatusChip {...chip} />}<a class="small" href={debateHref(l.record.id, 't', n.id)}>{t('terms.goTo')}</a></div>
            </li>
          );
        })}
      </ul>
      <details class="panel">
        <summary>{t('terms.library')}</summary>
        <p class="muted small">{t('terms.libraryNote')}</p>
        <dl class="library">
          {LIBRARY.map((e) => (
            <div key={e.id} class="lib-entry">
              <dt><span lang="ar">{e.ar}</span> · <span lang="en" dir="ltr">{e.en}</span></dt>
              <dd dir="auto">{lang.value === 'ar' ? e.defAr : e.defEn} <span class="muted small">[{e.source}]</span></dd>
            </div>
          ))}
        </dl>
      </details>
    </>
  );
}
