# StudyNest

A personal learning workspace for software engineering, designed for desktop browsers and phones. Browse three starter courses, step through examples and quick checks, and return to saved sections.

## Run locally

Open `index.html` in a browser for a quick look. To try installation and offline use, start a local server from this directory:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. A local server lets the browser register the offline service worker.

## GitHub Pages

Publish the repository root through GitHub Pages. The app uses relative asset paths and hash routes, so course and section links work from a project subdirectory. Once loaded successfully on HTTPS, the site can be installed from a supported browser. On iPhone, open the site in Safari and choose **Share → Add to Home Screen**.

## Add a lesson

The catalog lives in `courses.js`. Each course has ordered sections with stable IDs and an array of blocks. Supported blocks include text, notes, code, step-through examples, and multiple choice questions. Keep existing course and section IDs stable to preserve saved progress. Increment the cache version in `sw.js` after publishing file changes.

Give each course one square artwork file named `assets/<course-id>-art.webp` and add it to the offline asset list in `sw.js`. The dashboard, course cards, course pages, and lesson reader all display that same file.

Progress and bookmarks are stored in the browser on each device. This version uses authored lessons and requires no account or AI credentials.
