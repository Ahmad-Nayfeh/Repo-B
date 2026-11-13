import { useEffect, useState } from 'preact/hooks';
import { acceptIdentityPayload, acceptJoinLink, acceptUpdatePayload, showToast } from '../app/service';
import { debateHref, go } from '../app/router';
import { t } from '../i18n';
import { parseLink } from '../sync/links';
import { getDebate } from '../store/db';

/** Handles #/j, #/u, #/i links, then replaces the URL so the secret does not stay in the address bar. */
export function LinkHandler({ raw }: { raw: string }) {
  const [msg, setMsg] = useState('…');
  useEffect(() => {
    (async () => {
      const p = parseLink(raw);
      if (!p) { setMsg(t('home.pasteBad')); history.replaceState(null, '', '#/'); return; }
      try {
        if (p.kind === 'join') {
          const id = await acceptJoinLink(p);
          const rec = await getDebate(id);
          go(rec?.identity ? debateHref(id) : debateHref(id, 'join'), true);
        } else if (p.kind === 'update') {
          const n = await acceptUpdatePayload(p.debateId, p.payload);
          showToast(t('sync.imported', { n }));
          go(debateHref(p.debateId), true);
        } else {
          const name = await acceptIdentityPayload(p.debateId, p.payload);
          showToast(t('sync.identityImported', { name }));
          go(debateHref(p.debateId), true);
        }
      } catch (e) {
        const m = (e as Error).message;
        setMsg(m === 'need_invite' ? t('sync.needInviteFirst') : t('common.error', { msg: m }));
        history.replaceState(null, '', '#/');
      }
    })();
  }, [raw]);
  return <div class="page"><main class="content"><p class="center">{msg}</p><a class="btn" href="#/">{t('common.back')}</a></main></div>;
}
