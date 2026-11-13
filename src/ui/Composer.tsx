import { useMemo, useState } from 'preact/hooks';
import { addMove, editNode, showToast, type Loaded } from '../app/service';
import { debateHref, go } from '../app/router';
import { type StringKey, t } from '../i18n';
import { moveRequirementError } from '../model/rules';
import { ASSERTIONS, type NodeMeta, type Witness } from '../model/types';
import { Sheet, excerpt } from './common';
import { CITABLE, NEEDS_TEXT, composerOptions, moveLabel, type Action } from './logic';

export function Composer({ l, targetId, onClose, onPosted }: { l: Loaded; targetId: string | null; onClose: () => void; onPosted: () => void }) {
  const s = l.state;
  const me = l.me!;
  const target = targetId ? s.nodes.get(targetId) ?? null : null;
  const opts = useMemo(() => composerOptions(s, target, me), [s, target, me]);
  const first = opts.primary ?? opts.chips[0] ?? null;
  const [action, setAction] = useState<Action | null>(first);
  const [moreOpen, setMoreOpen] = useState(false);
  const [text, setText] = useState('');
  const [citation, setCitation] = useState(false);
  const [witness, setWitness] = useState<Witness | ''>('');
  const [ref, setRef] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(target?.text ?? '');

  const move = action?.move;
  const hint = useMemo(() => {
    if (!target || !move) return null;
    if (move === 'counter' && target.originalMove === 'claim' && !target.children.some((c) => s.nodes.get(c)!.move === 'reason' && s.nodes.get(c)!.authorId === target.authorId)) return t('compose.ghasbHint');
    if (move === 'ask_proof' && target.originalMove === 'claim' && target.children.some((c) => { const k = s.nodes.get(c)!; return k.move === 'reason' && k.authorId === target.authorId && !s.dead.has(k.id); })) return t('compose.askProofDup');
    return null;
  }, [target, move, s]);

  // nodes I authored (for see_also)
  const myAssertions = useMemo(() => [...s.nodes.values()].filter((n) => n.authorId === me && ASSERTIONS.has(n.move) && !s.dead.has(n.id) && n.id !== targetId).sort((a, b) => b.at - a.at).slice(0, 50), [s, me, targetId]);

  const send = async () => {
    if (!action || busy) return;
    const meta: NodeMeta = {};
    if (citation && CITABLE(action.move)) meta.origin = 'citation';
    if (action.move === 'refute' && witness) meta.witness = witness;
    if (action.move === 'see_also' && ref) meta.ref = ref;
    const e = moveRequirementError(action.move, meta, text, (id) => s.nodes.has(id));
    if (e) { setErr(t(`compose.err.${e}` as StringKey)); return; }
    setBusy(true);
    try {
      const id = await addMove(action.parentId, action.move, text, meta);
      onPosted();
      go(debateHref(l.record.id, 't', NEEDS_TEXT(action.move) ? id : action.parentId ?? undefined));
    } catch (er) { showToast(t('common.error', { msg: (er as Error).message })); setBusy(false); }
  };

  const saveEdit = async () => {
    if (!target || !editText.trim() || busy) return;
    setBusy(true);
    try { await editNode(target.id, editText); onClose(); } catch (er) { showToast(t('common.error', { msg: (er as Error).message })); setBusy(false); }
  };

  const chip = (a: Action) => (
    <button type="button" key={a.label + a.parentId} class={`btn chip-btn ${action === a ? 'selected' : ''}`} aria-pressed={action === a}
      onClick={() => { setAction(a); setErr(null); }}>{t(a.label)}</button>
  );
  const canEdit = target && target.authorId === me && NEEDS_TEXT(target.move);

  return (
    <Sheet open onClose={onClose} title={target ? t('tree.reply') : t('debate.addStandpoint')}>
      {target && (
        <p class="replying-to"><span class="muted small">{t('tree.repliesTo')} {moveLabel(target.move)}:</span> <span dir="auto">{excerpt(target.text || moveLabel(target.move), 120)}</span></p>
      )}
      {editing ? (
        <div class="form">
          <label class="label" for="edit">{t('compose.edit')}</label>
          <textarea id="edit" class="input" dir="auto" rows={5} maxLength={5000} value={editText} onInput={(e) => setEditText((e.target as HTMLTextAreaElement).value)} />
          <button type="button" class="btn primary block" disabled={busy || !editText.trim()} onClick={saveEdit}>{t('compose.save')}</button>
        </div>
      ) : (
        <div class="form">
          <div class="chips" role="group">
            {opts.primary && chip(opts.primary)}
            {opts.chips.map(chip)}
            {opts.more.length > 0 && !moreOpen && <button type="button" class="btn ghost chip-btn" onClick={() => setMoreOpen(true)}>{t('common.more')}…</button>}
          </div>
          {moreOpen && <div class="chips" role="group">{opts.more.map(chip)}</div>}
          {hint && <p class="hint small">{hint}</p>}
          {move === 'concede' && target && target.parentId === null && target.authorId !== me && (
            <p class="hint small" dir="auto">{t('compose.concedeRoot', { name: s.people.get(target.authorId)?.name ?? '?', text: excerpt(target.text, 80) })}</p>
          )}
          {move === 'refute' && (
            <fieldset class="choice">
              <legend class="label">{t('compose.witness')}</legend>
              {(['counterexample', 'impossibility'] as Witness[]).map((w) => (
                <label key={w} class={`option ${witness === w ? 'checked' : ''}`}><input type="radio" name="witness" checked={witness === w} onChange={() => setWitness(w)} /> <span>{t(`compose.witness.${w}`)}</span></label>
              ))}
            </fieldset>
          )}
          {move === 'see_also' && (
            <>
              <label class="label" for="ref">{t('compose.pickRef')}</label>
              <select id="ref" class="input" value={ref} onChange={(e) => setRef((e.target as HTMLSelectElement).value)}>
                <option value="">—</option>
                {myAssertions.map((n) => <option key={n.id} value={n.id}>{moveLabel(n.move)}: {excerpt(n.text, 60)}</option>)}
              </select>
            </>
          )}
          {action && (
            <>
              <label class="visually-hidden" for="ctext">{t('compose.placeholder')}</label>
              <textarea id="ctext" class="input" dir="auto" rows={NEEDS_TEXT(action.move) ? 5 : 2} maxLength={5000}
                placeholder={t('compose.placeholder')} value={text} onInput={(e) => { setText((e.target as HTMLTextAreaElement).value); setErr(null); }} />
            </>
          )}
          {action && CITABLE(action.move) && (
            <label class="check small"><input type="checkbox" checked={citation} onChange={(e) => setCitation((e.target as HTMLInputElement).checked)} /> {t('compose.citation')}</label>
          )}
          {err && <p class="error" role="alert">{err}</p>}
          <button type="button" class="btn primary block" disabled={!action || busy} onClick={send}>
            {action && !NEEDS_TEXT(action.move) ? t('compose.confirmStance') : t('common.send')}
          </button>
          {canEdit && <button type="button" class="btn ghost block" onClick={() => setEditing(true)}>{t('compose.edit')}</button>}
        </div>
      )}
    </Sheet>
  );
}
