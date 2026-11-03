# cengizhanbayram.github.io

Personal academic site of **Cengizhan Bayram** — LLM efficiency researcher and machine learning engineer.
Live at <https://cengizhanbayram.github.io>.

Plain HTML/CSS/JS, no build step. GitHub Pages serves `index.html` from the root of `main`.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | The home page, "the genius's blackboard": all content in Turkish and English (`lang="tr"` / `lang="en"` pairs) |
| `assets/css/board.css` | Blackboard theme: slate, chalk, Instrument Serif, yellow and pink chalk |
| `assets/js/board.js` | Language switch, chalk marks, formulas on the board (KaTeX), the pixel portrait, the mad-genius corrections and mode, fig. II, the closing Transformer block |
| `roma/index.html` | The earlier Roman "aureus" theme, kept as a backup (not indexed); it uses `assets/css/style.css` and `assets/js/main.js` |
| `assets/img/` | Portrait (`portrait-cutout.webp`, `portrait.jpg` for link previews), the CB emblem and favicons, the BJK crest for the easter egg |

## Editing

- Every visible sentence exists twice: one `<span lang="tr">` and one `<span lang="en">`. Change both.
- New publication: copy a `.pub-card` block in the Publications section.
- The formulas on the board, the struck-out corrections and the mad-genius scribbles are lists at the top of
  their functions in `assets/js/board.js` (`BOARD`, `FIXES`, `MAD_TEX`, `MAD_NOTES`).
- The home page and `roma/` carry their own copy of the content; edits to one do not reach the other.

Preview locally with `python -m http.server` and open <http://localhost:8000> (the pixel portrait needs a
server; it falls back to the plain photo when opened as a file).
