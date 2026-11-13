# Needs Ahmad

Things only the owner can do. Each item has exact steps. Everything else works without you.

## 1. Turn on GitHub Pages (one time, ~1 minute) — needed for the public link

The deploy workflow cannot switch Pages on by itself: GitHub's `configure-pages` action needs a personal token for that, and the built-in workflow token is not enough (checked in `actions/configure-pages` `action.yml`).

1. Open https://github.com/Ahmad-Nayfeh/Repo-B/settings/pages
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open https://github.com/Ahmad-Nayfeh/Repo-B/actions , click the workflow **Deploy to GitHub Pages**, then **Run workflow** (branch: `claude/new-session-1cdurq`).
4. When it turns green, the site is at **https://ahmad-nayfeh.github.io/Repo-B/**

If step 3 fails with an "environment protection" message: Settings → Environments → `github-pages` → Deployment branches → add `claude/new-session-1cdurq` (or "All branches"), then re-run.

## 2. Real-device checks this session could not do (10 minutes, optional but valuable)

Two things can only be tested on real phones:
- **WhatsApp → iPhone:** send yourself an invite link on WhatsApp, open it on an iPhone. Then add the site to the home screen, open the installed app, and paste the same link into «الصق رابطاً». Confirm the debate appears in both.
- **Long links:** in a debate with ~50 points, tap «أرسل تحديثاً» and send the link on WhatsApp. Confirm the link stays clickable on the receiving phone. (If not, use the backup file instead — the app offers it automatically for large updates.)

Report anything odd in `docs/STATUS.md` → Known problems, or tell the next session.
