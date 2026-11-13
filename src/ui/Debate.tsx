import { useEffect, useMemo, useState } from 'preact/hooks';
import { markBannerSeen, showToast, type Loaded, makeUpdate } from '../app/service';
import { debateHref } from '../app/router';
import { ago, fmtNum, listNames, t } from '../i18n';
import { obligationOf, pathTo } from '../model/derive';
import type { DNode, DebateState } from '../model/types';
import { Icon, StatusChip, TopBar, excerpt, shareFile, shareOrCopy } from './common';
import { Composer } from './Composer';
import { counters, groupOf, isClosedNode, moveLabel, nodeChip, personName } from './logic';
import { SyncTab } from './SyncTab';
import { TermsTab } from './TermsTab';

type Tab = 'status' | 'tree' | 'terms' | 'sync';

export function Debate({ l, tab, node }: { l: Loaded; tab: Tab; node?: string }) {
  const s = l.state;
  const [composeFor, setComposeFor] = useState<{ target: string | null } | null>(null);
  const [justPosted, setJustPosted] = useState(() => location.hash.includes('joined=1') && l.record.syncMode === 'manual');
  const joined = location.hash.includes('joined=1');
  const title = s.title || l.record.title;
  const tabs: Array<[Tab, string, string]> = [
    ['status', t('debate.tabStatus'), debateHref(l.record.id)],
    ['tree', t('debate.tabTree'), debateHref(l.record.id, 't')],
    ['terms', t('debate.tabTerms'), debateHref(l.record.id, 'terms')],
    ['sync', t('debate.tabSync'), debateHref(l.record.id, 'sync')],
  ];
  const onPosted = () => { setComposeFor(null); setJustPosted(true); };
  return (
    <div class="page">
      <TopBar title={title} back={tab === 'tree' && node ? upHref(l, node) : '#/'} />
      <nav class="tabs" role="tablist">
        {tabs.map(([k, label, href]) => (
          <a key={k} role="tab" aria-selected={tab === k} class={`tab ${tab === k ? 'active' : ''}`} href={href}>{label}</a>
        ))}
      </nav>
      <main class="content">
        {!l.me && (
          <div class="notice"><span>{t('debate.notJoined')}</span> <a class="btn small" href={debateHref(l.record.id, 'join')}>{t('debate.joinNow')}</a></div>
        )}
        {s.ignored > 0 && <p class="muted small">{t('debate.ignoredEvents', { n: s.ignored })}</p>}
        {justPosted && <PostedBar l={l} joined={joined} onClose={() => setJustPosted(false)} />}
        {tab === 'status' && <StatusTab l={l} />}
        {tab === 'tree' && <TreeTab l={l} focusId={node} onReply={(target) => setComposeFor({ target })} />}
        {tab === 'terms' && <TermsTab l={l} />}
        {tab === 'sync' && <SyncTab l={l} />}
      </main>
      {composeFor && l.me && (
        <Composer l={l} targetId={composeFor.target} onClose={() => setComposeFor(null)} onPosted={onPosted} />
      )}
    </div>
  );
}

function upHref(l: Loaded, nodeId: string): string {
  const parent = l.state.nodes.get(nodeId)?.parentId;
  return parent ? debateHref(l.record.id, 't', parent) : debateHref(l.record.id, 't');
}

function PostedBar({ l, onClose, joined }: { l: Loaded; onClose: () => void; joined?: boolean }) {
  const nudge = async () => {
    const r = await shareOrCopy({ text: t('debate.nudgeText', { title: l.state.title }) });
    if (r === 'copied') showToast(t('common.copied'));
  };
  const send = async () => {
    const u = await makeUpdate();
    if (u.url) { const r = await shareOrCopy({ text: t('debate.nudgeText', { title: l.state.title }), url: u.url }); if (r === 'copied') showToast(t('common.copied')); }
    else if (u.file) { showToast(t('sync.tooBigFile')); await shareFile(u.file.name, u.file.text); }
  };
  return (
    <div class="posted-bar" role="status">
      {joined && <span class="small">{t('debate.joinedTell')}</span>}
      {l.record.syncMode === 'manual'
        ? <button type="button" class="btn primary" onClick={send}><Icon name="share" />{t('debate.sendUpdate')}</button>
        : <button type="button" class="btn primary" onClick={nudge}><Icon name="share" />{t('debate.nudge')}</button>}
      <button type="button" class="btn ghost" onClick={onClose}>{t('common.close')}</button>
    </div>
  );
}

// ---- Status tab --------------------------------------------------------------------------------
function StatusTab({ l }: { l: Loaded }) {
  const s = l.state;
  const [showAll, setShowAll] = useState(false);
  useEffect(() => { void markBannerSeen(); }, []);
  const people = [...s.people.values()].sort((a, b) => a.joinOrder - b.joinOrder);
  const names = listNames(people.map((p) => p.name));
  const items = useMemo(() => waitingItems(s, l.me), [s, l.me]);
  const fresh = useMemo(() => [...s.nodes.values()]
    .filter((n) => n.authorId !== l.me && n.at > (l.record.prevSeenAt || 0))
    .sort((a, b) => b.at - a.at).slice(0, 6), [s, l.me, l.record.prevSeenAt]);
  const counts = useMemo(() => {
    let open = 0, answered = 0, closed = 0;
    for (const c of s.challenges.values()) {
      if (c.state === 'open' || c.state === 'proposal') open++;
      else if (c.state === 'answered' || c.state === 'challenged') answered++;
      else if (c.state !== 'moot') closed++;
    }
    return { open, answered, closed };
  }, [s]);
  const shown = showAll ? items : items.slice(0, 3);
  return (
    <>
      {!l.record.bannerSeen && <p class="banner">{t('debate.banner', { names, title: s.title })}</p>}
      {l.me && (
        <section aria-labelledby="w-h">
          <h2 id="w-h" class="section-title">{t('debate.waitingOnYou')}{items.length ? ` (${fmtNum(items.length)})` : ''}</h2>
          {items.length === 0 && <p class="muted">{t('debate.nothingWaiting')}</p>}
          <ul class="plain">
            {shown.map((it) => (
              <li key={it.key}>
                <a class={`wait-item ${it.kind}`} href={debateHref(l.record.id, 't', it.focus)}>
                  <StatusChip tone={it.kind === 'owe' ? 'owe' : 'move'} text={it.kind === 'owe' ? t('debate.youOwe') : t('debate.yourMove')} />
                  <span class="wait-text" dir="auto">{excerpt(it.text, 110)}</span>
                  <span class="muted small">{personName(s, it.by, l.me)} · {ago(it.at)}</span>
                </a>
              </li>
            ))}
          </ul>
          {items.length > 3 && !showAll && <button type="button" class="btn ghost" onClick={() => setShowAll(true)}>{t('common.showAll')}</button>}
        </section>
      )}

      <section aria-labelledby="n-h">
        <h2 id="n-h" class="section-title">{t('debate.newSince')}</h2>
        {fresh.length === 0 ? <p class="muted">{t('debate.noNew')}</p> : (
          <ul class="plain">
            {fresh.map((n) => (
              <li key={n.id}>
                <a class="fresh-item" href={debateHref(l.record.id, 't', n.id)}>
                  <span class="move-badge">{moveLabel(n.move)}</span>
                  <span dir="auto">{n.text ? excerpt(n.text, 100) : t('stance.on', { text: excerpt(n.parentId ? s.nodes.get(n.parentId)?.text ?? '' : '', 80) })}</span>
                  <span class="muted small">{personName(s, n.authorId, l.me)} · {ago(n.at)}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="p-h">
        <h2 id="p-h" class="section-title">{t('debate.participants')}</h2>
        <ul class="people">
          {people.map((p) => {
            const ob = obligationOf(s, p.id);
            return (
              <li key={p.id} class="person">
                <span class="person-name" dir="auto">{personName(s, p.id, l.me)}</span>
                <span class="small">{p.id === l.me
                  ? `${t('debate.youOwe')}: ${fmtNum(ob.owes.length)} · ${t('debate.yourMove')}: ${fmtNum(ob.yourMove.length)}`
                  : `${t('debate.owesN', { n: ob.owes.length })} · ${t('debate.moveN', { n: ob.yourMove.length })}`}</span>
              </li>
            );
          })}
        </ul>
        <p class="muted small">{t('debate.counts', counts)}</p>
      </section>

      <section aria-labelledby="s-h">
        <h2 id="s-h" class="section-title">{t('debate.standpoints')}</h2>
        <ul class="plain">
          {s.roots.map((id) => {
            const n = s.nodes.get(id)!; const chip = nodeChip(s, n, l.me);
            return (
              <li key={id}>
                <a class="fresh-item" href={debateHref(l.record.id, 't', id)}>
                  <strong dir="auto">{personName(s, n.authorId, l.me)}:</strong> <span dir="auto">{excerpt(n.text, 140)}</span>
                  {chip && <StatusChip {...chip} />}
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <SearchBox l={l} />
    </>
  );
}

interface WaitItem { key: string; kind: 'owe' | 'move'; focus: string; text: string; by: string; at: number }
function waitingItems(s: DebateState, me: string | null): WaitItem[] {
  if (!me) return [];
  const ob = obligationOf(s, me);
  const out: WaitItem[] = [];
  for (const targetId of ob.owes) {
    const open = s.nodes.get(targetId)!.children.map((c) => s.nodes.get(c)!).filter((c) => s.challenges.get(c.id)?.state === 'open');
    const first = open[0]; if (!first) continue;
    out.push({ key: `o${targetId}`, kind: 'owe', focus: open.length === 1 ? first.id : targetId, text: first.text, by: first.authorId, at: first.at });
  }
  for (const cid of ob.yourMove) {
    const ch = s.challenges.get(cid)!;
    const focus = ch.latestAnswerId ?? cid;
    const n = s.nodes.get(focus)!;
    out.push({ key: `m${cid}`, kind: 'move', focus, text: n.text || moveLabel(n.move), by: n.authorId, at: n.at });
  }
  return out.sort((a, b) => a.at - b.at);
}

function SearchBox({ l }: { l: Loaded }) {
  const s = l.state;
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (needle.length < 2) return null;
    return [...s.nodes.values()].filter((n) => n.text.toLowerCase().includes(needle)).slice(0, 30);
  }, [s, q]);
  return (
    <section>
      <label class="label" for="search"><Icon name="search" /> {t('debate.search')}</label>
      <input id="search" class="input" type="search" dir="auto" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
      {results && (results.length === 0 ? <p class="muted">{t('debate.searchNone')}</p> : (
        <ul class="plain">
          {results.map((n) => (
            <li key={n.id}><a class="fresh-item" href={debateHref(l.record.id, 't', n.id)}><span class="move-badge">{moveLabel(n.move)}</span><span dir="auto">{excerpt(n.text, 110)}</span></a></li>
          ))}
        </ul>
      ))}
    </section>
  );
}

// ---- Tree tab ----------------------------------------------------------------------------------
type Filter = 'open' | 'mine' | 'all';

function TreeTab({ l, focusId, onReply }: { l: Loaded; focusId?: string; onReply: (target: string | null) => void }) {
  const s = l.state;
  const [filter, setFilter] = useState<Filter>('all');
  const [showClosed, setShowClosed] = useState(false);
  const focus = focusId ? s.nodes.get(focusId) : undefined;
  const cnt = counters(s, l.me);
  useEffect(() => { setShowClosed(false); window.scrollTo(0, 0); }, [focusId]);

  const childIds = focus ? focus.children : s.roots;
  const children = childIds.map((id) => s.nodes.get(id)!);
  const pass = (n: DNode) => filter === 'all' || (filter === 'open' ? (cnt.open.get(n.id) ?? 0) > 0 : (cnt.mine.get(n.id) ?? 0) > 0);
  const visible = children.filter(pass);
  const openFirst = (a: DNode, b: DNode) => ((cnt.open.get(b.id) ?? 0) > 0 ? 1 : 0) - ((cnt.open.get(a.id) ?? 0) > 0 ? 1 : 0) || b.at - a.at;
  const live = visible.filter((n) => !isClosedNode(s, n)).sort(openFirst);
  const closed = visible.filter((n) => isClosedNode(s, n));
  const groups: Array<['assert' | 'challenge' | 'answer' | 'stance', string]> = [
    ['challenge', t('tree.groupChallenge')], ['answer', t('tree.groupAnswer')], ['assert', t('tree.groupAssert')], ['stance', t('tree.groupStance')],
  ];

  return (
    <>
      {focus ? <Breadcrumb l={l} node={focus} /> : <h2 class="section-title">{t('tree.root')}</h2>}
      {focus && <NodeCard l={l} n={focus} focused onReply={() => onReply(focus.id)} />}

      <div class="filters" role="group">
        {(['all', 'open', 'mine'] as Filter[]).map((f) => (
          <button type="button" key={f} class={`btn small ${filter === f ? 'selected' : ''}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? t('tree.filterAll') : f === 'open' ? t('tree.filterOpen') : t('tree.filterMine')}
          </button>
        ))}
      </div>

      {focus && (cnt.open.get(focus.id) ?? 0) === 0 && children.length > 0 && <p class="muted small">{t('tree.branchClear')}</p>}
      {children.length === 0 && <p class="muted">{t('tree.empty')}</p>}

      {groups.map(([g, label]) => {
        const xs = live.filter((n) => groupOf(n, focus) === g);
        if (!xs.length) return null;
        return (
          <section key={g} class="group">
            <h3 class="group-title">{label}</h3>
            {xs.map((n) => <NodeCard key={n.id} l={l} n={n} />)}
          </section>
        );
      })}
      {closed.length > 0 && (
        <section class="group">
          <button type="button" class="btn ghost" aria-expanded={showClosed} onClick={() => setShowClosed(!showClosed)}>{t('tree.closedN', { n: closed.length })}</button>
          {showClosed && closed.map((n) => <NodeCard key={n.id} l={l} n={n} />)}
        </section>
      )}
      {!focus && l.me && (
        <button type="button" class="btn block" onClick={() => onReply(null)}><Icon name="plus" />{t('debate.addStandpoint')}</button>
      )}
      {!focus && <SearchBox l={l} />}
    </>
  );
}

function Breadcrumb({ l, node }: { l: Loaded; node: DNode }) {
  const s = l.state;
  const path = pathTo(s, node.id).slice(0, -1).map((id) => s.nodes.get(id)!);
  const crumbs = path.length > 3 ? [path[0]!, null, ...path.slice(-2)] : path;
  return (
    <nav class="breadcrumb" aria-label="breadcrumb">
      <a href={debateHref(l.record.id, 't')}>{t('tree.root')}</a>
      {crumbs.map((c, i) => c === null
        ? <span key={`e${i}`} class="crumb-sep">… ›</span>
        : <span key={c.id}><span class="crumb-sep">›</span> <a href={debateHref(l.record.id, 't', c.id)} dir="auto">{moveLabel(c.move)}: {excerpt(c.text || '', 28)}</a></span>)}
    </nav>
  );
}

export function NodeCard({ l, n, focused, onReply }: { l: Loaded; n: DNode; focused?: boolean; onReply?: () => void }) {
  const s = l.state;
  const chip = nodeChip(s, n, l.me);
  const cnt = counters(s, l.me);
  const openBelow = (cnt.open.get(n.id) ?? 0) - (s.challenges.get(n.id) && ['open', 'answered', 'proposal'].includes(s.challenges.get(n.id)!.state) ? 1 : 0);
  const gone = isClosedNode(s, n);
  const [showHist, setShowHist] = useState(false);
  const ref = n.meta.ref ? s.nodes.get(n.meta.ref) : undefined;
  const body = (
    <>
      <div class="card-head">
        <span class={`move-badge move-${n.move}`}>{moveLabel(n.move)}</span>
        <span class="author" dir="auto">{personName(s, n.authorId, l.me)}</span>
        <span class="muted small">{ago(n.at)}</span>
      </div>
      {n.text && <p class={`card-text ${focused ? '' : 'clamp'}`} dir="auto">{n.text}</p>}
      {!n.text && n.parentId && <p class="muted small" dir="auto">{t('stance.on', { text: excerpt(s.nodes.get(n.parentId)?.text || moveLabel(s.nodes.get(n.parentId)!.move), 90) })}</p>}
      {n.meta.origin === 'citation' && <p class="muted small">{t('compose.citation')}</p>}
      {n.meta.witness && <p class="muted small">{t(`compose.witness.${n.meta.witness}`)}</p>}
      {ref && <p class="small">→ <a href={debateHref(l.record.id, 't', ref.id)} dir="auto">{excerpt(ref.text, 60)}</a></p>}
      <div class="card-foot">
        {chip && <StatusChip {...chip} />}
        {n.editedAfterReply ? <span class="pill">{t('common.editedAfterReply')}</span> : n.versions.length > 1 && <span class="pill">{t('common.edited')}</span>}
        {!focused && n.children.length > 0 && <span class="muted small">{t('tree.replies', { n: n.children.length })}</span>}
        {!focused && openBelow > 0 && <span class="pill pill-open">{t('tree.openBelow', { n: openBelow })}</span>}
      </div>
    </>
  );
  if (!focused) return <a class={`card ${gone ? 'gone' : ''}`} href={debateHref(l.record.id, 't', n.id)}>{body}</a>;
  return (
    <article class={`card focused ${gone ? 'gone' : ''}`}>
      {body}
      {n.versions.length > 1 && (
        <div>
          <button type="button" class="btn ghost small" aria-expanded={showHist} onClick={() => setShowHist(!showHist)}>{t('common.history')} ({fmtNum(n.versions.length - 1)})</button>
          {showHist && <ol class="history">{n.versions.slice(0, -1).map((v, i) => <li key={i} dir="auto"><span class="muted small">{ago(v.at)}</span> {v.text}</li>)}</ol>}
        </div>
      )}
      {l.me && onReply && <button type="button" class="btn primary block reply-btn" onClick={onReply}><Icon name="reply" />{t('tree.reply')}</button>}
    </article>
  );
}
