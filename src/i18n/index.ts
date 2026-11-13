import { signal } from '@preact/signals';
import { ar, type StringKey } from './ar';
import { en } from './en';

export type Lang = 'ar' | 'en';
export const lang = signal<Lang>('ar');
export const digits = signal<'arab' | 'latn'>('arab');

const tables: Record<Lang, Record<StringKey, string>> = { ar, en };

export function fmtNum(n: number): string {
  const ns = lang.value === 'ar' ? digits.value : 'latn';
  return new Intl.NumberFormat(lang.value === 'ar' ? 'ar' : 'en', { numberingSystem: ns, useGrouping: false }).format(n);
}

export function t(key: StringKey, params?: Record<string, string | number>): string {
  let s = tables[lang.value][key] ?? key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, typeof v === 'number' ? fmtNum(v) : v);
  return s;
}

export function listNames(names: string[]): string {
  return new Intl.ListFormat(lang.value, { style: 'long', type: 'conjunction' }).format(names);
}

export function ago(ts: number, now = Date.now()): string {
  const m = Math.max(0, Math.round((now - ts) / 60000));
  if (m < 1) return t('common.justNow');
  const span = m < 60 ? t('common.minutes', { n: m }) : m < 60 * 24 ? t('common.hours', { n: Math.round(m / 60) }) : t('common.days', { n: Math.round(m / 1440) });
  return t('common.ago', { t: span });
}

export function applyDocumentLang() {
  const html = document.documentElement;
  html.lang = lang.value;
  html.dir = lang.value === 'ar' ? 'rtl' : 'ltr';
}

export type { StringKey };
