// Takes phone-sized screenshots of the live web demo for the website.
// Usage: node docs/img/shoot.mjs         website shots (390 wide, iPhone UA) into docs/img
//        node docs/img/shoot.mjs store   App Store 6.9" shots (1320 x 2868) into store/screenshots
//        node docs/img/shoot.mjs play    Google Play phone shots (1080 x 2160) into store/play/screenshots
// Needs Google Chrome; uses Node's built-in WebSocket.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));
const APP = 'https://happyleafy-app.devendr.workers.dev';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const MODE = process.argv[2];
const STORE = MODE === 'store' || MODE === 'play';
const SITE_SHOTS = [
  { file: 'today.png', path: '/?demo=1&clean=1', height: 844 },
  { file: 'plant.png', path: '/plant/demo-monty?demo=1&clean=1', height: 844 },
  { file: 'plant-care.png', path: '/plant/demo-monty?demo=1&clean=1', height: 844, scrollTo: 'Care guide' },
];
// 440 x 956 points at 3x = 1320 x 2868, Apple's 6.9" iPhone size. No iPhone UA, so the web install hint stays hidden.
const STORE_SHOTS = [
  { file: '1-today.png', path: '/?demo=1&clean=1' },
  { file: '2-soil-check.png', path: '/?demo=1&clean=1', tap: '[aria-label="Mark water done for Monty"]' },
  { file: '3-plant.png', path: '/plant/demo-monty?demo=1&clean=1' },
  { file: '4-care-guide.png', path: '/plant/demo-monty?demo=1&clean=1', scrollTo: 'Care guide' },
  { file: '5-my-plants.png', path: '/plants?demo=1&clean=1' },
  { file: '6-doctor.png', path: '/doctor?demo=1&clean=1' },
].map((s) => (MODE === 'play' ? { ...s, width: 360, height: 720 } : { ...s, width: 440, height: 956 })); // Play: 1080 x 2160, the tallest it accepts (2:1)
const SHOTS = STORE ? STORE_SHOTS : SITE_SHOTS;
const DEST = MODE === 'play' ? join(OUT, '../../store/play/screenshots') : STORE ? join(OUT, '../../store/screenshots') : OUT;

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--hide-scrollbars', '--user-data-dir=/tmp/hl-shots-profile', 'about:blank'], { stdio: 'ignore' });
try {
  let ws;
  for (let i = 0; i < 50 && !ws; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = targets.find((t) => t.type === 'page');
      if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
    } catch {
      await sleep(200);
    }
  }
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  await send('Page.enable');
  if (!STORE) await send('Emulation.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  });
  mkdirSync(DEST, { recursive: true });
  for (const shot of SHOTS) {
    await send('Emulation.setDeviceMetricsOverride', { width: shot.width ?? 390, height: shot.height, deviceScaleFactor: 3, mobile: true });
    await send('Page.navigate', { url: APP + shot.path });
    await sleep(6000); // let the app load and entrance animations finish
    if (shot.scrollTo) {
      await send('Runtime.evaluate', {
        expression: `(() => { const el = [...document.querySelectorAll('div')].find(d => d.childElementCount === 0 && d.textContent.trim().toLowerCase() === ${JSON.stringify(shot.scrollTo.toLowerCase())}); if (el) el.scrollIntoView({ block: 'start' }); })()`,
      });
      await sleep(800);
    }
    if (shot.tap) {
      // Pressable on web listens to pointer events, so tap the CSS selector with real mouse input at the element's centre.
      const { result } = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => { const el = document.querySelector(${JSON.stringify(shot.tap)}); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`,
      });
      if (!result.value) throw new Error(`nothing to tap for ${shot.tap}`);
      for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, ...result.value, button: 'left', clickCount: 1 });
      await sleep(1500);
    }
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(DEST, shot.file), Buffer.from(data, 'base64'));
    // Publish as compact JPEG: sips -Z 1200 -s format jpeg -s formatOptions 78 <file>.png --out <file>.jpg
    console.log('saved', shot.file);
  }
  ws.close();
} finally {
  chrome.kill();
}
