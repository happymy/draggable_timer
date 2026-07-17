import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const PAGE_KEY = `stopwatch-position-test.example.com`;
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

function reparentStopwatch() {
  const el = document.getElementById('draggable-stopwatch');
  if (!el) return;
  const fs = document.fullscreenElement || document.webkitFullscreenElement;
  if (fs && el.parentNode !== fs) {
    fs.appendChild(el);
  } else if (!fs && el.parentNode !== document.body) {
    document.body.appendChild(el);
  }
}

describe('pad', () => {
  it('pads single digit', () => {
    expect(pad(0)).toBe('00');
    expect(pad(5)).toBe('05');
    expect(pad(9)).toBe('09');
  });

  it('does not pad double digits', () => {
    expect(pad(10)).toBe('10');
    expect(pad(59)).toBe('59');
    expect(pad(99)).toBe('99');
  });
});

describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats seconds only', () => {
    expect(formatTime(5)).toBe('00:05');
    expect(formatTime(59)).toBe('00:59');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(90)).toBe('01:30');
    expect(formatTime(599)).toBe('09:59');
    expect(formatTime(600)).toBe('10:00');
  });

  it('handles overflow beyond 59:59', () => {
    expect(formatTime(3600)).toBe('60:00');
    expect(formatTime(3661)).toBe('61:01');
  });
});

describe('updateDisplay', () => {
  beforeEach(() => {
    elapsed = 0;
  });

  it('sets textContent on the display element', () => {
    const display = document.createElement('span');
    elapsed = 65;
    updateDisplay(display);
    expect(display.textContent).toBe('01:05');
  });

  it('sets content as text node not HTML', () => {
    const display = document.createElement('span');
    updateDisplay(display);
    expect(display.childNodes.length).toBe(1);
    expect(display.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
  });
});

describe('tick', () => {
  beforeEach(() => {
    elapsed = 0;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('increments elapsed and updates display', () => {
    const display = document.createElement('span');
    tick(display);
    expect(elapsed).toBe(1);
    expect(display.textContent).toBe('00:01');
  });

  it('increments correctly over multiple ticks', () => {
    const display = document.createElement('span');
    tick(display);
    tick(display);
    tick(display);
    expect(elapsed).toBe(3);
    expect(display.textContent).toBe('00:03');
  });
});

describe('resetStopwatch', () => {
  beforeEach(() => {
    elapsed = 42;
    timerId = null;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resets elapsed to 0 and updates display', () => {
    const display = document.createElement('span');
    display.textContent = '00:42';
    resetStopwatch(display);
    expect(elapsed).toBe(0);
    expect(display.textContent).toBe('00:00');
  });

  it('starts counting after reset', () => {
    const display = document.createElement('span');
    resetStopwatch(display);
    vi.advanceTimersByTime(5000);
    expect(elapsed).toBe(5);
    expect(display.textContent).toBe('00:05');
  });

  it('clears previous timer before starting new one', () => {
    const clearSpy = vi.spyOn(global, 'clearInterval');
    const display = document.createElement('span');
    timerId = setInterval(() => {}, 1000);
    resetStopwatch(display);
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it('handles no existing timer gracefully', () => {
    const display = document.createElement('span');
    expect(() => resetStopwatch(display)).not.toThrow();
    expect(elapsed).toBe(0);
  });
});

describe('savePosition', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves element position to localStorage', () => {
    const el = document.createElement('div');
    el.style.left = '100px';
    el.style.top = '200px';
    savePosition(el);
    const saved = JSON.parse(localStorage.getItem(PAGE_KEY));
    expect(saved).toEqual({ left: 100, top: 200 });
  });

  it('falls back to 0 when position is not set', () => {
    const el = document.createElement('div');
    savePosition(el);
    const saved = JSON.parse(localStorage.getItem(PAGE_KEY));
    expect(saved).toEqual({ left: 0, top: 0 });
  });
});

describe('reparentStopwatch', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      writable: true,
      value: null,
    });
  });

  it('moves element into fullscreen element when in fullscreen', () => {
    const el = document.createElement('div');
    el.id = 'draggable-stopwatch';
    document.body.appendChild(el);

    const fs = document.createElement('div');
    fs.id = 'fullscreen-element';
    document.body.appendChild(fs);
    document.fullscreenElement = fs;

    reparentStopwatch();
    expect(el.parentNode).toBe(fs);
  });

  it('moves element back to body when exiting fullscreen', () => {
    const fs = document.createElement('div');
    fs.id = 'fullscreen-element';
    document.body.appendChild(fs);

    const el = document.createElement('div');
    el.id = 'draggable-stopwatch';
    fs.appendChild(el);
    document.fullscreenElement = null;

    reparentStopwatch();
    expect(el.parentNode).toBe(document.body);
  });

  it('does nothing when element does not exist', () => {
    expect(() => reparentStopwatch()).not.toThrow();
  });

  it('does not move element if already in correct parent', () => {
    const el = document.createElement('div');
    el.id = 'draggable-stopwatch';
    document.body.appendChild(el);

    const originalParent = el.parentNode;
    reparentStopwatch();
    expect(el.parentNode).toBe(originalParent);
  });
});
