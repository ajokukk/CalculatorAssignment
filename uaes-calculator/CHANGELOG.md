# Changelog

All notable changes to this project are listed here.

## [1.0.0] - 2026-10-09

### Added
- UAES branding: logo badge and "UAES CALCULATOR" title in the header, with a generic fallback emblem if the logo file is missing.
- GPA / CGPA tab with 5.0 and 4.0 scales, class of degree, progress bar, target planner and a copy-result button.
- Calculator history, live answer preview, `Ans` key, bracket and percent keys, keyboard support.
- Saved entries in the browser (`localStorage`).
- README with run, customise and merge instructions, plus this changelog and a licence.

### Changed
- Cartoon calculator redesign (orange shell, blue-purple edge, light-blue keys, brown round buttons, red square keys).
- Responsive layout for phones, tablets and desktop.
- Project split into `index.html`, `style.css` and `script.js`. Styles are scoped under `.uaes-app` and the script runs inside an IIFE, so it can be merged into an existing site.
- Real operator symbols (`×`, `÷`, `−`) on the keys.

### Removed
- `eval()`, replaced by a safe expression parser.
- Inline `onclick` handlers and the global functions `appendToDisplay()`, `clearDisplay()` and `calculate()`.
- The `^` (power) key and the old `<input id="display">`.

## [0.1.0] - earlier

- First version: basic calculator with `C`, `^`, `%`, `/`, `*`, `-`, `+`, `.` and `=`.
