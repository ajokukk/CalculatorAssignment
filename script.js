/* ==========================================================================
   UAES CALCULATOR — logic
   Wrapped in an IIFE so nothing leaks into the global scope (safe to merge).
   Sections: logo fallback · tabs · calculator · GPA / CGPA
   ========================================================================== */
(function () {
  'use strict';

  /* ============ Logo fallback ============ */
  const logoImg = document.getElementById('logoImg');
  const logoFallback = document.getElementById('logoFallback');
  function useFallbackLogo() {
    if (logoImg) logoImg.hidden = true;
    if (logoFallback) logoFallback.hidden = false;
  }
  if (logoImg) {
    logoImg.addEventListener('error', useFallbackLogo);
    if (logoImg.complete && logoImg.naturalWidth === 0) useFallbackLogo();
  }

  /* ============ Tabs ============ */
  const tabCalc = document.getElementById('tabCalc'), tabGpa = document.getElementById('tabGpa');
  const panelCalc = document.getElementById('panelCalc'), panelGpa = document.getElementById('panelGpa');
  function showTab(which) {
    const g = which === 'gpa';
    tabCalc.classList.toggle('active', !g); tabGpa.classList.toggle('active', g);
    tabCalc.setAttribute('aria-selected', !g); tabGpa.setAttribute('aria-selected', g);
    panelCalc.classList.toggle('active', !g); panelGpa.classList.toggle('active', g);
  }
  tabCalc.onclick = () => showTab('calc');
  tabGpa.onclick = () => showTab('gpa');

  let toastTimer;
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.style.display = 'none'; }, 1600);
  }

  /* ============ Calculator ============ */
  const exprEl = document.getElementById('expr');
  const previewEl = document.getElementById('preview');
  const historyEl = document.getElementById('history');
  let expr = '', lastAnswer = '', justEvaluated = false;
  const history = [];

  /* Safe parser (no eval). Supports + − × ÷ ( ) % and unary minus.
     "200+10%" = 220 (percent of the left side), "50%" = 0.5 */
  function evaluate(src) {
    const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    let i = 0;
    const peek = () => s[i];
    function number() {
      const m = /^\d*\.?\d+|^\d+\.?/.exec(s.slice(i));
      if (!m) throw new Error('num');
      i += m[0].length;
      return parseFloat(m[0]);
    }
    function primary() {
      let v, pct = false;
      if (peek() === '(') {
        i++; v = expression().v;
        if (peek() !== ')') throw new Error('paren');
        i++;
      } else if (peek() === '-') { i++; const p = primary(); return { v: -p.v, pct: p.pct }; }
      else if (peek() === '+') { i++; return primary(); }
      else v = number();
      while (peek() === '%') { i++; v = v / 100; pct = true; }
      return { v, pct };
    }
    function term() {
      let a = primary();
      while (peek() === '*' || peek() === '/') {
        const op = s[i++]; const b = primary();
        if (op === '*') a = { v: a.v * b.v, pct: false };
        else { if (b.v === 0) throw new Error('div0'); a = { v: a.v / b.v, pct: false }; }
      }
      return a;
    }
    function expression() {
      let a = term();
      while (peek() === '+' || peek() === '-') {
        const op = s[i++]; const b = term();
        const rhs = b.pct ? a.v * b.v : b.v;
        a = { v: op === '+' ? a.v + rhs : a.v - rhs, pct: false };
      }
      return a;
    }
    const r = expression();
    if (i !== s.length) throw new Error('syntax');
    if (!isFinite(r.v)) throw new Error('inf');
    return r.v;
  }
  const fmt = n => parseFloat(n.toPrecision(12)).toString().replace(/e\+?/, 'e');
  const autoClose = e => { const o = (e.match(/\(/g) || []).length - (e.match(/\)/g) || []).length; return o > 0 ? e + ')'.repeat(o) : e; };

  function render() {
    exprEl.textContent = expr || '0';
    exprEl.scrollLeft = exprEl.scrollWidth;
    previewEl.textContent = '';
    if (expr && !justEvaluated && /[−+×÷%(]/.test(expr.slice(1))) {
      try { previewEl.textContent = '= ' + fmt(evaluate(autoClose(expr))); } catch (e) { /* incomplete expression */ }
    }
  }
  function pushHistory(h) {
    history.push(h); if (history.length > 30) history.shift();
    historyEl.innerHTML = '';
    history.forEach(x => {
      const d = document.createElement('div');
      d.textContent = x.text;
      d.onclick = () => { expr = x.result; justEvaluated = false; render(); };
      historyEl.appendChild(d);
    });
    historyEl.scrollTop = historyEl.scrollHeight;
  }
  const isOp = c => '+−×÷'.includes(c);

  function input(v) {
    if (justEvaluated) { expr = (isOp(v) || v === '%') ? lastAnswer : ''; justEvaluated = false; }
    const last = expr.slice(-1);
    if (isOp(v)) {
      if (!expr) { if (v === '−') expr = '−'; render(); return; }
      if (last === '(' && v !== '−') return;
      if (isOp(last)) expr = expr.slice(0, -1);
    }
    if (v === '.') {
      const cur = expr.split(/[−+×÷()%]/).pop();
      if (cur.includes('.')) return;
      if (cur === '') v = '0.';
    }
    if (v === '%' && (!expr || isOp(last) || last === '(')) return;
    if (v === ')') {
      const open = (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;
      if (open <= 0 || isOp(last) || last === '(') return;
    }
    if (/\d/.test(v) && (last === ')' || last === '%')) expr += '×';
    if (v === '(' && (/\d/.test(last) || last === ')' || last === '%')) expr += '×';
    expr += v; render();
  }
  function equals() {
    if (!expr) return;
    const full = autoClose(expr);
    try {
      const res = fmt(evaluate(full));
      pushHistory({ text: `${full} = ${res}`, result: res });
      lastAnswer = res; expr = res; justEvaluated = true;
      previewEl.textContent = ''; exprEl.textContent = res;
    } catch (e) { previewEl.textContent = 'Error'; exprEl.textContent = expr; }
  }
  function action(a) {
    if (a === 'clear') { expr = ''; justEvaluated = false; render(); }
    else if (a === 'back') { if (justEvaluated) { expr = ''; justEvaluated = false; } else expr = expr.slice(0, -1); render(); }
    else if (a === 'equals') equals();
    else if (a === 'ans') { if (lastAnswer) { if (justEvaluated) expr = ''; justEvaluated = false; expr += lastAnswer; render(); } }
    else if (a === 'gpa') showTab('gpa');
  }
  document.querySelector('.uaes-app .calc').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.act) action(b.dataset.act); else if (b.dataset.v) input(b.dataset.v);
  });
  document.addEventListener('keydown', e => {
    if (!panelCalc.classList.contains('active') || e.target.matches('input, select, textarea')) return;
    const k = e.key;
    if (/^[0-9.()%]$/.test(k)) input(k);
    else if (k === '+') input('+');
    else if (k === '-') input('−');
    else if (k === '*' || k === 'x') input('×');
    else if (k === '/') { e.preventDefault(); input('÷'); }
    else if (k === 'Enter' || k === '=') { e.preventDefault(); equals(); }
    else if (k === 'Backspace') action('back');
    else if (k === 'Escape' || k === 'Delete') action('clear');
  });
  render();

  /* ============ GPA / CGPA ============ */
  /* Edit these tables to match your school's grading policy. */
  const SCALES = {
    5: { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 },
    4: { A: 4, B: 3, C: 2, D: 1, F: 0 }
  };
  /* Class-of-degree cut-offs, highest first: [minimum CGPA, label] */
  const CLASSES = {
    5: [[4.5, 'First Class'], [3.5, 'Second Class Upper (2:1)'], [2.4, 'Second Class Lower (2:2)'], [1.5, 'Third Class'], [1.0, 'Pass'], [0, 'Fail']],
    4: [[3.7, 'First Class / Summa'], [3.3, 'Upper Second / Magna'], [2.7, 'Lower Second / Cum Laude'], [2.0, 'Pass'], [0, 'Below pass']]
  };

  const coursesEl = document.getElementById('courses');
  const scaleEl = document.getElementById('scale');
  const prevCgpaEl = document.getElementById('prevCgpa');
  const prevUnitsEl = document.getElementById('prevUnits');
  const targetEl = document.getElementById('target');
  const remEl = document.getElementById('remUnits');
  const STORAGE_KEY = 'uaes-calculator-v1';
  let lastSummary = '';

  const gradeOptions = (scale, sel) => Object.keys(SCALES[scale]).map(g => `<option value="${g}"${g === sel ? ' selected' : ''}>${g} (${SCALES[scale][g]})</option>`).join('');

  function addCourse(data = {}) {
    const row = document.createElement('div');
    row.className = 'course';
    row.innerHTML = `
      <input class="c-name" type="text" placeholder="MTH101" aria-label="Course name">
      <input class="c-units" type="number" inputmode="numeric" min="0" step="1" placeholder="3" aria-label="Credit units">
      <select class="c-grade" aria-label="Grade">${gradeOptions(scaleEl.value, data.grade || 'A')}</select>
      <button class="del" aria-label="Remove course">×</button>`;
    row.querySelector('.c-name').value = data.name || '';
    row.querySelector('.c-units').value = data.units ?? '';
    row.querySelector('.del').onclick = () => { row.remove(); computeGpa(); };
    row.addEventListener('input', computeGpa);
    coursesEl.appendChild(row);
  }
  function classOf(c, scale) {
    return CLASSES[scale].find(([min]) => c >= min)[1];
  }
  function vibeOf(ratio) {
    if (ratio >= 0.9) return 'First class energy. Go touch grass.';
    if (ratio >= 0.7) return '2:1 territory. Solid. Keep the pace.';
    if (ratio >= 0.48) return '2:2 zone. Room for a comeback.';
    if (ratio >= 0.3) return 'Lock in. Next semester is your arc.';
    return 'Red alert. See your course adviser, no shame.';
  }
  function computeGpa() {
    const scale = scaleEl.value, max = +scale;
    let units = 0, points = 0;
    [...coursesEl.children].forEach(r => {
      const u = parseFloat(r.querySelector('.c-units').value);
      const g = r.querySelector('.c-grade').value;
      if (u > 0 && g in SCALES[scale]) { units += u; points += u * SCALES[scale][g]; }
    });
    const gpa = units ? points / units : 0;
    const pu = parseFloat(prevUnitsEl.value) || 0, pc = parseFloat(prevCgpaEl.value) || 0;
    const total = units + pu;
    const cgpa = total ? (points + pc * pu) / total : 0;
    document.getElementById('gpaVal').textContent = gpa.toFixed(2);
    document.getElementById('cgpaVal').textContent = cgpa.toFixed(2);
    document.getElementById('unitsLbl').textContent = `Total units: ${total}`;
    document.getElementById('clsVal').textContent = total ? classOf(cgpa, scale) : '—';
    document.getElementById('vibe').textContent = total ? vibeOf(cgpa / max) : 'Add your courses to see your damage.';
    document.getElementById('barMax').textContent = max.toFixed(1);
    document.getElementById('fill').style.width = Math.min(100, cgpa / max * 100) + '%';
    drawTicks(scale);
    lastSummary = total ? `GPA ${gpa.toFixed(2)} | CGPA ${cgpa.toFixed(2)} (${scale}.0 scale) | ${total} units | ${classOf(cgpa, scale)}` : '';
    plan(cgpa, total, max);
    save();
  }
  function drawTicks(scale) {
    const bar = document.getElementById('bar');
    bar.querySelectorAll('.tick').forEach(t => t.remove());
    CLASSES[scale].map(c => c[0]).filter(m => m > 0).forEach(m => {
      const t = document.createElement('div'); t.className = 'tick'; t.style.left = (m / +scale * 100) + '%'; bar.appendChild(t);
    });
  }
  function plan(cgpa, total, max) {
    const out = document.getElementById('plannerOut');
    const target = parseFloat(targetEl.value), rem = parseFloat(remEl.value);
    out.className = 'planner-out';
    if (!(target > 0) || !(rem > 0)) { out.textContent = 'Fill both boxes. Do the math, skip the panic.'; return; }
    if (target > max) { out.textContent = `Target is above the ${max.toFixed(1)} max. Pick a real one.`; out.classList.add('bad'); return; }
    const need = (target * (total + rem) - cgpa * total) / rem;
    if (need > max + 1e-9) {
      out.textContent = `You'd need ${need.toFixed(2)}, which is above the ${max.toFixed(1)} max. Not reachable in ${rem} units. Aim lower or add more units.`;
      out.classList.add('bad');
    } else if (need <= 0) {
      out.textContent = `Already safe. You can hold ${target.toFixed(2)} even with a 0.00 next semester. Don't test it.`;
      out.classList.add('ok');
    } else {
      out.textContent = `You need an average GPA of ${need.toFixed(2)} across the next ${rem} units to finish on ${target.toFixed(2)}.`;
      out.classList.add('ok');
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        scale: scaleEl.value, prevCgpa: prevCgpaEl.value, prevUnits: prevUnitsEl.value,
        target: targetEl.value, rem: remEl.value,
        courses: [...coursesEl.children].map(r => ({
          name: r.querySelector('.c-name').value, units: r.querySelector('.c-units').value, grade: r.querySelector('.c-grade').value
        }))
      }));
    } catch (e) { /* storage unavailable (private mode etc.) */ }
  }
  function load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { /* ignore */ }
    if (d) {
      scaleEl.value = d.scale || '5';
      prevCgpaEl.value = d.prevCgpa || ''; prevUnitsEl.value = d.prevUnits || '';
      targetEl.value = d.target || ''; remEl.value = d.rem || '';
      (d.courses || []).forEach(addCourse);
    }
    if (!coursesEl.children.length) for (let i = 0; i < 4; i++) addCourse();
    computeGpa();
  }

  scaleEl.addEventListener('change', () => {
    const rows = [...coursesEl.children].map(r => ({
      name: r.querySelector('.c-name').value, units: r.querySelector('.c-units').value, grade: r.querySelector('.c-grade').value
    }));
    coursesEl.innerHTML = '';
    rows.forEach(r => addCourse({ ...r, grade: r.grade in SCALES[scaleEl.value] ? r.grade : 'A' }));
    computeGpa();
  });
  document.getElementById('addCourse').onclick = () => addCourse();
  document.getElementById('resetGpa').onclick = () => {
    coursesEl.innerHTML = ''; [prevCgpaEl, prevUnitsEl, targetEl, remEl].forEach(e => { e.value = ''; });
    for (let i = 0; i < 4; i++) addCourse();
    computeGpa();
  };
  document.getElementById('copyBtn').onclick = async () => {
    if (!lastSummary) { toast('Nothing to copy yet'); return; }
    try { await navigator.clipboard.writeText(lastSummary); toast('Copied!'); }
    catch (e) { toast(lastSummary); }
  };
  [prevCgpaEl, prevUnitsEl, targetEl, remEl].forEach(e => e.addEventListener('input', computeGpa));
  load();
})();
