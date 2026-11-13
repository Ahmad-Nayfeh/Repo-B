import { render } from 'preact';
import { loadSettings, refreshList } from './app/service';
import { applyDocumentLang } from './i18n';
import { initSync } from './sync/engine';
import { App } from './ui/App';
import './styles.css';

async function start() {
  await loadSettings();
  applyDocumentLang();
  initSync();
  await refreshList();
  render(<App />, document.getElementById('app')!);
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* offline support unavailable */ });
  }
}
void start();
