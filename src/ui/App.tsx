import { useEffect, useState } from 'preact/hooks';
import { current, openDebate, refreshList, toast } from '../app/service';
import { route } from '../app/router';
import { applyDocumentLang, lang, t } from '../i18n';
import { syncNow } from '../sync/engine';
import { Debate } from './Debate';
import { Home } from './Home';
import { Join } from './Join';
import { LinkHandler } from './LinkHandler';
import { NewDebate } from './NewDebate';
import { About, Guide } from './Static';

export function App() {
  const r = route.value;
  useEffect(() => { applyDocumentLang(); }, [lang.value]);
  return (
    <>
      {r.name === 'home' && <Home />}
      {r.name === 'new' && <NewDebate />}
      {r.name === 'about' && <About />}
      {r.name === 'guide' && <Guide />}
      {r.name === 'link' && <LinkHandler raw={r.raw} />}
      {r.name === 'debate' && <DebateRoute id={r.id} tab={r.tab} node={r.node} />}
      {toast.value && <div class="toast" role="status" aria-live="polite">{toast.value}</div>}
    </>
  );
}

function DebateRoute({ id, tab, node }: { id: string; tab: 'status' | 'tree' | 'terms' | 'sync' | 'join'; node?: string }) {
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let alive = true;
    void openDebate(id).then((l) => { if (alive) setMissing(!l); });
    void syncNow(id);
    const iv = setInterval(() => { if (document.visibilityState === 'visible') void syncNow(id); }, 60_000);
    const vis = () => { if (document.visibilityState === 'visible') void syncNow(id); };
    document.addEventListener('visibilitychange', vis);
    return () => { alive = false; clearInterval(iv); document.removeEventListener('visibilitychange', vis); void refreshList(); };
  }, [id]);
  const l = current.value;
  if (missing) return <div class="page"><main class="content"><p>{t('sync.needInviteFirst')}</p><a class="btn" href="#/">{t('common.back')}</a></main></div>;
  if (!l || l.record.id !== id) return <div class="page"><main class="content"><p class="center muted">…</p></main></div>;
  if (tab === 'join' || (!l.me && l.state.people.size === 0)) return <Join l={l} />;
  return <Debate l={l} tab={tab} node={node} />;
}
