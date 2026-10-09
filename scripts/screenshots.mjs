// Regenerates the README screenshots from the running app. Usage:
//   npx expo start --web --port 8090      (in one terminal)
//   npm run screenshots                   (in another)
// Needs Google Chrome. Set CHROME_PATH if it is not in the default macOS location.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:8090';
const OUT = new URL('../docs/screenshots/', import.meta.url).pathname;
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const site = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const wait = (ms) => site.waitForTimeout(ms);

// website
await site.goto(`${BASE}/`, { waitUntil: 'load' }); await wait(1900);
await site.screenshot({ path: `${OUT}web-0-splash.png` });          // the first-visit splash
await wait(4500);
await site.screenshot({ path: `${OUT}web-1-home.png` });
await site.goto(`${BASE}/?nosplash`, { waitUntil: 'load' }); await wait(3000);
await site.getByText('The Y-WLTH App Is For Y-WLTH Clients', { exact: true }).first().scrollIntoViewIfNeeded();
await site.mouse.move(700, 450); await site.mouse.wheel(0, 700); await wait(1200);
await site.screenshot({ path: `${OUT}web-2-onboarding-story.png` });
await site.goto(`${BASE}/faq?nosplash`, { waitUntil: 'load' }); await wait(3000);
await site.getByPlaceholder(/Search, e.g./).fill('how do i sign up?'); await wait(600);
await site.screenshot({ path: `${OUT}web-4-faq-search.png` });

// the app, at phone size, in the browser
const phone = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2 });
for (const [path, name] of [['/home', 'app-1-wealth'], ['/insights', 'app-2-intelligence'], ['/money', 'app-3-money'], ['/plan', 'app-4-plan'], ['/profile', 'app-5-profile']]) {
  await phone.goto(`${BASE}${path}?nosplash`, { waitUntil: 'load' }); await phone.waitForTimeout(3800);
  await phone.screenshot({ path: `${OUT}${name}.png` });
}
await browser.close();
console.log('Screenshots written to docs/screenshots/');
