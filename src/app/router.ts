import { signal } from '@preact/signals';

export type Route =
  | { name: 'home' }
  | { name: 'new' }
  | { name: 'about' }
  | { name: 'guide' }
  | { name: 'link'; raw: string }
  | { name: 'debate'; id: string; tab: 'status' | 'tree' | 'terms' | 'sync' | 'join'; node?: string };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, '');
  if (/^\/[jui]\//.test(h)) return { name: 'link', raw: hash };
  const parts = h.split('?')[0]!.split('/').filter(Boolean);
  if (parts[0] === 'new') return { name: 'new' };
  if (parts[0] === 'about') return { name: 'about' };
  if (parts[0] === 'guide') return { name: 'guide' };
  if (parts[0] === 'd' && parts[1]) {
    const id = decodeURIComponent(parts[1]);
    switch (parts[2]) {
      case 't': return { name: 'debate', id, tab: 'tree', node: parts[3] ? decodeURIComponent(parts[3]) : undefined };
      case 'terms': return { name: 'debate', id, tab: 'terms' };
      case 'sync': return { name: 'debate', id, tab: 'sync' };
      case 'join': return { name: 'debate', id, tab: 'join' };
      default: return { name: 'debate', id, tab: 'status' };
    }
  }
  return { name: 'home' };
}

export const route = signal<Route>(parseHash(location.hash));
addEventListener('hashchange', () => { route.value = parseHash(location.hash); });

export function go(hash: string, replace = false) {
  if (replace) { history.replaceState(null, '', hash); route.value = parseHash(hash); }
  else location.hash = hash;
}
export const debateHref = (id: string, tab = '', node?: string) =>
  `#/d/${encodeURIComponent(id)}${tab ? `/${tab}` : ''}${node ? `/${encodeURIComponent(node)}` : ''}`;
