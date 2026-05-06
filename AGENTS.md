# AGENTS.md

## Cursor Cloud specific instructions

This is a static landing page for Liftie (corporate carpooling service). There are **zero dependencies** — no package manager, no build step, no test framework.

### Running the dev server

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser. Any static file server works.

### Key notes

- **No lint / test / build commands exist.** The project is plain HTML/CSS/JS with no tooling.
- The site fetches live news from `api.rss2json.com` (RSS proxy) — this is optional and has a graceful fallback if the external API is unreachable.
- External links to `https://pwa.liftie.co.za` point to the actual Liftie PWA app, which is a separate project.
- The `Liftie Logo.jpeg` image is referenced in `index.html` but is present in the repo — verify it exists if the logo appears broken.
- The contact form uses `mailto:` links (opens the user's email client); there is no backend form processing.
