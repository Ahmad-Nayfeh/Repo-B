import { useEffect, useState } from 'preact/hooks';
import { acceptIdentityPayload, acceptJoinLink, acceptUpdatePayload, showToast } from '../app/service';
import { debateHref, go } from '../app/router';
import { t } from '../i18n';
import { parseLink } from '../sync/links';
import { getDebate } from '../store/db';

export function errorText(m: string): string {
  if (m === 'need_invite') return t('sync.needInviteFirst');
  if (['secret_mismatch', 'identity_kept', 'bad_identity', 'unrecognised_file', 'payload_too_large'].includes(m)) return t(`err.${m}` as never);
  return t('common.error', { msg: m });
}

/** Handles #/j, #/u, #/i links, then replaces the URL so the secret does not stay in the address bar. */
export function LinkHandler({ raw }: { raw: string }) {
  const [msg, setMsg] = useState('…');
  useEffect(() => {
    (async () => {
      const p = parseLink(raw);
      if (!p) { setMsg(t('home.pasteBad')); history.replaceState(null, '', '#/link-error'); return; }
      try {
        if (p.kind === 'join') {
          const id = await acceptJoinLink(p);
          const rec = await getDebate(id);
          go(rec?.identity ? debateHref(id) : debateHref(id, 'join'), true);
        } else if (p.kind === 'update') {
          const n = await acceptUpdatePayload(p.debateId, p.payload);
          if (n > 0) showToast(t('sync.imported', { n }));
          go(debateHref(p.debateId), true);
        } else {
          const name = await acceptIdentityPayload(p.debateId, p.payload, (nm) => confirm(t('sync.identityConfirm', { name: nm })));
          showToast(t('sync.identityImported', { name }));
          go(debateHref(p.debateId), true);
        }
      } catch (e) {
        const m = (e as Error).message;
        setMsg(errorText(m));
        history.replaceState(null, '', '#/link-error'); // secret leaves the address bar; '#/' link below still navigates
      }
    })();
  }, [raw]);
  return <div class="page"><main class="content"><p class="center">{msg}</p><a class="btn" href="#/">{t('common.back')}</a></main></div>;
}
