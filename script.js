// Simple calculator logic
(() => {
  const display = document.getElementById('display');
  const keys = document.getElementById('keys');

  let expr = '';          // stores the current expression as a string
  let lastWasOperator = false;

  function updateDisplay(value) {
    display.textContent = value;
  }

  function safeEval(raw) {
    // Replace visual operators with JS operators
    const jsExpr = raw.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    try {
      // Use Function constructor to avoid direct eval call; still only for local simple calculator.
      // Limit result precision
      const result = Function('"use strict"; return (' + jsExpr + ')')();
      if (!isFinite(result)) return 'Error';
      // Trim to reasonable decimal places
      return Math.round((result + Number.EPSILON) * 1e12) / 1e12;
    } catch (e) {
      return 'Error';
    }
  }

  function inputDigit(d) {
    if (expr === '0' && d === '0') return;
    if (lastWasOperator) {
      expr += d;
      lastWasOperator = false;
    } else {
      expr = (expr === '0') ? d : expr + d;
    }
    updateDisplay(expr);
  }

  function inputDecimal() {
    // Prevent multiple decimals in the current number
    const parts = expr.split(/[\+\-\×\÷\*\/]/);
    const last = parts[parts.length - 1] || '';
    if (last.includes('.')) return;
    if (last === '') {
      expr += '0.';
    } else {
      expr += '.';
    }
    lastWasOperator = false;
    updateDisplay(expr);
  }

  function handleOperator(op) {
    if (expr === '' && op === '-') {
      // allow negative numbers at start
      expr = '-';
      updateDisplay(expr);
      lastWasOperator = false;
      return;
    }
    if (lastWasOperator) {
      // replace last operator
      expr = expr.slice(0, -1) + op;
    } else {
      expr += op;
      lastWasOperator = true;
    }
    updateDisplay(expr);
  }

  function applyPercent() {
    // Turn trailing number into number / 100
    const m = expr.match(/(\d*\.?\d+)$/);
    if (!m) return;
    const num = parseFloat(m[1]);
    const percent = (num / 100).toString();
    expr = expr.slice(0, -m[1].length) + percent;
    updateDisplay(expr);
  }

  function clearAll() {
    expr = '';
    lastWasOperator = false;
    updateDisplay('0');
  }

  function backspace() {
    if (expr.length === 0) return;
    expr = expr.slice(0, -1);
    if (expr === '') updateDisplay('0'); else updateDisplay(expr);
    lastWasOperator = /[\+\-×÷\*\/]$/.test(expr);
  }

  function calculate() {
    if (expr === '') return;
    // Prevent trailing operator
    if (lastWasOperator) expr = expr.slice(0, -1);
    const result = safeEval(expr);
    expr = String(result);
    lastWasOperator = false;
    updateDisplay(expr);
  }

  // Button clicks
  keys.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const value = btn.dataset.value;

    switch (action) {
      case 'digit': inputDigit(value); break;
      case 'decimal': inputDecimal(); break;
      case 'operator': handleOperator(value); break;
      case 'equals': calculate(); break;
      case 'clear': clearAll(); break;
      case 'back': backspace(); break;
      case 'percent': applyPercent(); break;
    }
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
      inputDigit(e.key);
      e.preventDefault();
      return;
    }
    if (e.key === '.') { inputDecimal(); e.preventDefault(); return; }
    if (e.key === 'Enter' || e.key === '=') { calculate(); e.preventDefault(); return; }
    if (e.key === 'Backspace') { backspace(); e.preventDefault(); return; }
    if (e.key === 'Escape') { clearAll(); e.preventDefault(); return; }
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
      const map = {'*':'×','/':'÷'};
      handleOperator(map[e.key] || e.key);
      e.preventDefault();
      return;
    }
    // Allow % key
    if (e.key === '%') { applyPercent(); e.preventDefault(); return; }
  });

  // initialize
  clearAll();
})();
