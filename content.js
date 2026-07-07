const PAGE_KEY = `stopwatch-position-${window.location.hostname}`;
let elapsed = 0;
let timerId = null;

const drag = { el: null, isDragging: false, hasDragged: false, offsetX: 0, offsetY: 0 };

function savePosition(el) {
  try {
    const pos = {
      left: parseInt(el.style.left, 10) || 0,
      top: parseInt(el.style.top, 10) || 0
    };
    localStorage.setItem(PAGE_KEY, JSON.stringify(pos));
  } catch (e) {}
}

function pad(n) {
  return n.toString().padStart(2, '0');
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

function updateDisplay(display) {
  display.textContent = formatTime(elapsed);
}

function tick(display) {
  elapsed++;
  updateDisplay(display);
}

function resetStopwatch(display) {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  elapsed = 0;
  updateDisplay(display);
  timerId = setInterval(tick, 1000, display);
}

function createStopwatch() {
  if (document.getElementById('draggable-stopwatch')) return;
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  const el = document.createElement('div');
  el.id = 'draggable-stopwatch';

  const display = document.createElement('span');
  display.className = 'stopwatch-display';
  el.appendChild(display);

  document.body.appendChild(el);
  updateDisplay(display);

  try {
    const saved = localStorage.getItem(PAGE_KEY);
    if (saved) {
      const { left, top } = JSON.parse(saved);
      el.style.left = left + 'px';
      el.style.top = top + 'px';
      el.style.right = 'auto';
    }
  } catch (e) {
    localStorage.removeItem(PAGE_KEY);
  }

  el.addEventListener('mousedown', function(e) {
    drag.el = el;
    drag.isDragging = true;
    drag.hasDragged = false;
    drag.offsetX = e.clientX - el.getBoundingClientRect().left;
    drag.offsetY = e.clientY - el.getBoundingClientRect().top;
    el.style.cursor = 'grabbing';
  });

  el.addEventListener('touchstart', function(e) {
    drag.el = el;
    drag.isDragging = true;
    drag.hasDragged = false;
    const touch = e.touches[0];
    drag.offsetX = touch.clientX - el.getBoundingClientRect().left;
    drag.offsetY = touch.clientY - el.getBoundingClientRect().top;
  });

  el.addEventListener('click', function() {
    if (drag.hasDragged) return;
    resetStopwatch(display);
  });
}

document.addEventListener('mousemove', function(e) {
  if (!drag.isDragging || !drag.el) return;
  drag.hasDragged = true;
  const x = e.clientX - drag.offsetX;
  const y = e.clientY - drag.offsetY;
  const maxX = window.innerWidth - drag.el.offsetWidth;
  const maxY = window.innerHeight - drag.el.offsetHeight;
  drag.el.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
  drag.el.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
  drag.el.style.right = 'auto';
});

document.addEventListener('mouseup', function() {
  if (!drag.el) return;
  drag.isDragging = false;
  drag.el.style.cursor = 'move';
  if (drag.hasDragged) savePosition(drag.el);
});

document.addEventListener('touchmove', function(e) {
  if (!drag.isDragging || !drag.el) return;
  drag.hasDragged = true;
  e.preventDefault();
  const touch = e.touches[0];
  const x = touch.clientX - drag.offsetX;
  const y = touch.clientY - drag.offsetY;
  const maxX = window.innerWidth - drag.el.offsetWidth;
  const maxY = window.innerHeight - drag.el.offsetHeight;
  drag.el.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
  drag.el.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
  drag.el.style.right = 'auto';
}, { passive: false });

document.addEventListener('touchend', function() {
  if (!drag.el) return;
  drag.isDragging = false;
  if (drag.hasDragged) savePosition(drag.el);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createStopwatch);
} else {
  createStopwatch();
}

if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(function(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && !document.getElementById('draggable-stopwatch')) {
        createStopwatch();
        break;
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
