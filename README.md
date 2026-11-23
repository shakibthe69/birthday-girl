# A Little Birthday Magic for Rifa

A responsive, six-scene birthday surprise made with HTML, CSS, JavaScript, and Three.js. The experience uses the supplied photographs and song from local, relative asset paths.

## Project files

- `index.html` — scene markup and accessible controls
- `styles.css` — responsive visual design and transitions
- `app.js` — Three.js objects, animations, and interactions
- `assets/images/` — the two supplied photographs
- `assets/music/` — the supplied birthday song

## Run locally

Serve this folder over HTTP; opening `index.html` directly may prevent JavaScript modules from loading.

For example, with Python installed:

```powershell
py -m http.server 8000
```

Then open <http://localhost:8000>. Three.js and its text font are loaded from jsDelivr, and the optional typefaces are loaded from Google Fonts.

## Deploy to GitHub Pages

1. Push the project files and `assets/` directory to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select the branch and `/ (root)` folder, then save.
4. Open the Pages URL shown in the settings once deployment finishes.

The site uses relative paths for its own media and does not need a repository-specific base-path setting. GitHub Pages serves the files over HTTPS. The Three.js module, 3D title font, and optional web fonts use HTTPS CDNs.

## Media and music

The source photographs and song were copied as-is into the `assets/` folder. Music playback starts only after the visitor presses **Enter your surprise**; the on-page controls can pause, resume, or mute it.
