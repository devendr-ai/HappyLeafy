// Takes phone-sized screenshots of the live web demo for the website.
// Usage: node docs/img/shoot.mjs   (needs Google Chrome; uses Node's built-in WebSocket)
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));
const APP = 'https://happyleafy-app.devendr.workers.dev';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const SHOTS = [
  { file: 'today.png', path: '/?demo=1&clean=1', height: 844 },
  { file: 'plant.png', path: '/plant/demo-monty?demo=1&clean=1', height: 844 },
  { file: 'plant-care.png', path: '/plant/demo-monty?demo=1&clean=1', height: 844, scrollTo: 'Care guide' },
  { file: 'advice.png', path: '/plant/demo-monty?demo=1&clean=1', height: 844, scrollTo: 'Saved advice' },
];

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
  await send('Emulation.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  });
  for (const shot of SHOTS) {
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: shot.height, deviceScaleFactor: 3, mobile: true });
    await send('Page.navigate', { url: APP + shot.path });
    await sleep(6000); // let the app load and entrance animations finish
    if (shot.scrollTo) {
      await send('Runtime.evaluate', {
        expression: `(() => { const el = [...document.querySelectorAll('div')].find(d => d.childElementCount === 0 && d.textContent.trim().toLowerCase() === ${JSON.stringify(shot.scrollTo.toLowerCase())}); if (el) el.scrollIntoView({ block: 'start' }); })()`,
      });
      await sleep(800);
    }
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(OUT, shot.file), Buffer.from(data, 'base64'));
    console.log('saved', shot.file);
  }
  ws.close();
} finally {
  chrome.kill();
}
