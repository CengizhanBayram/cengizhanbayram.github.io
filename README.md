# cengizhanbayram.github.io

Personal academic site of **Cengizhan Bayram** — LLM efficiency researcher and machine learning engineer.
Live at <https://cengizhanbayram.github.io>.

Plain HTML/CSS/JS, no build step. GitHub Pages serves `index.html` from the root of `main`.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | All content, in Turkish and English (`lang="tr"` / `lang="en"` pairs) |
| `assets/css/style.css` | "Aureus" theme: black marble, gold, Pompeian red, Cinzel capitals |
| `assets/js/main.js` | Language switch, coin portrait, laurel, section line drawings, fig. II |
| `assets/img/` | Portrait (`portrait-cutout.webp` for the coin, `portrait.jpg` for link previews), the CB emblem (`emblem.png` master, `emblem-128.png` in the nav) and favicons cut from it |
| `assets/cv/` | CV (PDF) |

## Editing

- Every visible sentence exists twice: one `<span lang="tr">` and one `<span lang="en">`. Change both.
- New publication: copy a `.pub-card` block in the Publications section.
- The line drawing behind each section is chosen by the section's `data-art` attribute
  (`armillary`, `euclid`, `dome`, `aqueduct`, `temple`, `sundial`, `mosaic`, `laurel`).

Preview locally with `python -m http.server` and open <http://localhost:8000> (the coin's halftone
effect needs a server; it falls back to the plain photo when opened as a file).
