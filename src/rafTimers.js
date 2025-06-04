class RafScheduler {
  constructor() {
    this.timers = [];
    this.running = false;
    this.last = 0;
    this._tick = this._tick.bind(this);
  }

  _tick(now) {
    const delta = now - this.last;
    this.last = now;
    for (let i = this.timers.length - 1; i >= 0; i -= 1) {
      const t = this.timers[i];
      if (t.cancelled) {
        this.timers.splice(i, 1);
        continue;
      }
      t.remaining -= delta;
      if (t.remaining <= 0) {
        this.timers.splice(i, 1);
        t.cb();
      }
    }
    if (this.timers.length > 0) {
      requestAnimationFrame(this._tick);
    } else {
      this.running = false;
    }
  }

  start() {
    if (!this.running) {
      this.running = true;
      this.last = performance.now();
      requestAnimationFrame(this._tick);
    }
  }

  setTimeout(cb, delay) {
    const timer = { cb, remaining: delay, cancelled: false };
    this.timers.push(timer);
    this.start();
    return timer;
  }

  clearTimeout(timer) {
    if (timer) timer.cancelled = true;
  }
}

const scheduler = new RafScheduler();
export const rafSetTimeout = (cb, delay) => scheduler.setTimeout(cb, delay);
export const rafClearTimeout = (timer) => scheduler.clearTimeout(timer);

