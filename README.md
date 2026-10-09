# UAES Calculator

A mobile-friendly calculator with built-in **GPA / CGPA tools** for university students. Plain HTML, CSS and JavaScript: no frameworks, no build step, no dependencies.

> **Unofficial student project.** It is not an official tool of the University of Agriculture and Environmental Sciences, Umuagwo. See [Branding and logo](#branding-and-logo).

## Features

**Calculator**
- Add, subtract, multiply, divide, brackets and percentages
- Safe expression parser (the old `eval()` is gone, so nothing typed into the display can run as code)
- Live answer preview while you type, tappable history, `Ans` key to reuse the last answer
- Smart percentages: `200 + 10%` gives `220`, and `50%` gives `0.5`
- Keyboard support on desktop: digits, `+ - * /`, `Enter`, `Backspace`, `Esc`

**GPA / CGPA**
- 5.0 scale (A=5 ... F=0) and 4.0 scale (A=4 ... F=0)
- Add as many courses as you need: name, credit units, grade
- Semester GPA, plus CGPA when you enter your previous CGPA and units
- Class of degree, with a progress bar showing where each class boundary sits
- **Target planner**: enter the CGPA you want and the units you have left, and it tells you the GPA you need (or that the target can't be reached)
- **Copy result** button for sharing a one-line summary
- Your entries are saved in your browser (`localStorage`), so they're still there next time

**Design and mobile**
- Cartoon calculator look: orange shell, blue-purple edge, light-blue keys
- Responsive: keys, fonts and the display scale with screen width (small phones, large phones, tablets, desktop)
- 16px+ input text so iPhones don't zoom in when you tap a field
- Number fields open the numeric keypad on phones
- Respects "reduce motion" settings

## Project structure

```
uaes-calculator/
├── index.html      # markup (brand header, calculator, GPA tab)
├── style.css       # all styles, scoped under .uaes-app
├── script.js       # all logic, wrapped in an IIFE (no globals)
├── assets/
│   └── logo.png    # the logo shown in the header
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## Run it

No install needed.

1. Keep the files together in one folder, with `assets/logo.png` in place.
2. Double-click `index.html`.

To test on your phone, run a local server and open the address on the same Wi-Fi:

```bash
cd uaes-calculator
python3 -m http.server 8000
# then open http://<your-computer-ip>:8000 on your phone
```

The fonts (Patrick Hand and Baloo 2) load from Google Fonts. Offline, the page falls back to a system font and still works.

## How the GPA maths works

```
Semester GPA = sum(units x grade points) / sum(units)

CGPA = (current points + previous CGPA x previous units)
       / (current units + previous units)

Needed GPA for a target = (target x (total units + units to go)
                           - CGPA x total units) / units to go
```

**Default grade points**

| Grade | 5.0 scale | 4.0 scale |
|-------|-----------|-----------|
| A     | 5         | 4         |
| B     | 4         | 3         |
| C     | 3         | 2         |
| D     | 2         | 1         |
| E     | 1         | n/a       |
| F     | 0         | 0         |

**Default class of degree (5.0 scale)**

| CGPA        | Class                    |
|-------------|--------------------------|
| 4.50 - 5.00 | First Class              |
| 3.50 - 4.49 | Second Class Upper (2:1) |
| 2.40 - 3.49 | Second Class Lower (2:2) |
| 1.50 - 2.39 | Third Class              |
| 1.00 - 1.49 | Pass                     |
| below 1.00  | Fail                     |

**Check these against your school's official grading policy.** Cut-offs differ between universities. To change them, edit the `SCALES` and `CLASSES` tables at the top of the GPA section in `script.js`. Nothing else needs to change.

## Customising

| I want to...                | Edit...                                                              |
|-----------------------------|----------------------------------------------------------------------|
| Change colours              | The CSS variables at the top of `style.css` (`--body`, `--key`, ...) |
| Change the title            | The `<h1>` in `index.html`                                           |
| Swap the logo               | Replace `assets/logo.png` (square or near-square, 300px+ is plenty)  |
| Change grade points         | `SCALES` in `script.js`                                              |
| Change class boundaries     | `CLASSES` in `script.js`                                             |
| Change the funny messages   | `vibeOf()` in `script.js`                                            |
| Add a new scale (e.g. 7.0)  | Add it to `SCALES` and `CLASSES`, then add an `<option>` to `#scale` |

## Merging into your existing code

Your earlier version was a single `index.html` with inline styles and inline `onclick` handlers. This version is split into three files and scoped so it won't disturb the rest of your site.

### Option A: replace the old calculator (simplest)

1. Delete the old `<style>` block and old `<script>` block from your page.
2. Copy `style.css`, `script.js` and the `assets/` folder next to your page.
3. Replace the old `<div class="calculator">...</div>` with the whole `<div class="uaes-app">...</div>` block from `index.html`. Remove the `is-page` class so it doesn't force a full-screen height.
4. In `<head>`, add:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Baloo+2:wght@600;800&display=swap" rel="stylesheet">
   <link rel="stylesheet" href="style.css">
   ```
5. Just before `</body>`, add `<script src="script.js"></script>`.
6. Open the page and check the [test checklist](#test-checklist).

### Option B: add it as a section or a separate page

Paste the `.uaes-app` block wherever you want it. If it lives on its own page, you can keep `is-page` on it. The CSS and JS don't need to change.

### Things that can clash (check these)

- **Element IDs.** The script finds elements by these IDs: `logoImg`, `logoFallback`, `tabCalc`, `tabGpa`, `panelCalc`, `panelGpa`, `expr`, `preview`, `history`, `toast`, `courses`, `scale`, `addCourse`, `resetGpa`, `prevCgpa`, `prevUnits`, `target`, `remUnits`, `gpaVal`, `cgpaVal`, `unitsLbl`, `clsVal`, `bar`, `fill`, `barMax`, `vibe`, `copyBtn`, `plannerOut`. If your page already uses any of them, rename them in both `index.html` and `script.js`.
- **Old inline handlers.** The old code used global functions `appendToDisplay()`, `clearDisplay()` and `calculate()`. The new buttons use `data-` attributes instead, so you can delete the old functions and any `onclick="..."` attributes.
- **The old display input.** The old `<input id="display">` is replaced by the `#expr` / `#preview` / `#history` display. Delete the old input.
- **Operators.** The new keys use `×`, `÷` and `−` (real symbols), which the parser converts internally. If another script reads the display text and expects `*` or `/`, update it.
- **The `^` key.** It existed in the old version. It is not in this layout (there is no room in the 4x4 grid), and the parser doesn't support powers. If you need it, add a `^` branch to `term()` in `script.js` and a key in `index.html`.
- **Global CSS.** All rules are scoped under `.uaes-app`. The only global rule is `body { margin: 0; }` at the top of `style.css`, which you can delete if your site already resets margins.
- **Saved data.** Entries are stored under the key `uaes-calculator-v1`. Change `STORAGE_KEY` in `script.js` if you want a different name.

## Branding and logo

The header shows `assets/logo.png`. If that file is missing or fails to load, the page automatically shows a plain generic emblem instead, so there is never a broken image.

The UAES logo belongs to the university. Before you publish this anywhere public (a school portal, a social post, a hosted link):

- Get permission from the university (for example Student Affairs, ICT or the Public Relations office) to use the logo.
- Keep the "Unofficial student tool" line in the footer unless the university adopts the app.
- If permission isn't given, replace `assets/logo.png` with your own image. Nothing else changes.

## Deploy for free

Any static host works, since there is no server code:

- **GitHub Pages:** push the folder to a repo, then Settings > Pages > deploy from the `main` branch.
- **Netlify or Vercel:** drag the folder onto the dashboard.

## Test checklist

After merging, check each of these:

- [ ] `7 + 3 x 2 =` shows `13`
- [ ] `(2 + 3) x 4 =` shows `20`
- [ ] `200 + 10 %` shows `220`
- [ ] `5 / 0 =` shows `Error` (it does not crash)
- [ ] History lines are tappable and `Ans` inserts the last answer
- [ ] GPA tab: with `3 units A` and `2 units C`, GPA is `4.20` on the 5.0 scale
- [ ] CGPA: previous CGPA `4.00` over `60` units, plus the case above, gives a CGPA of about `4.02`
- [ ] Target planner shows a clear message when the target is unreachable
- [ ] Refresh the page: your courses are still there
- [ ] On a phone (or browser dev tools at 360px wide): no sideways scrolling, no zoom when tapping inputs
- [ ] Rename `assets/logo.png` temporarily: the fallback emblem appears

## Known limitations

- No exponent (`^`) or scientific functions yet.
- CGPA uses one "previous CGPA + units" record, not a full semester-by-semester history.
- Results are for guidance only. Your department's official records always win.

## Credits and licence

- Code: see `LICENSE` (MIT). The licence covers the code only. It does **not** cover the university logo.
- Fonts: Patrick Hand and Baloo 2 from Google Fonts (SIL Open Font Licence).
- The look is inspired by a hand-drawn calculator illustration. No third-party illustration files are included in this project.
