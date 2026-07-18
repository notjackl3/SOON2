import { chromium } from 'playwright';
const out = '/private/tmp/claude-501/-Users-sophie-Projects-SOON2/3bc08eac-29ed-49c3-a905-201efed8be9b/scratchpad';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
await page.mouse.move(720, 300);
await page.evaluate(() => window.scrollBy(0, 340));
// wait for entrance (~1.4s) + draw (~0.9s) + buffer
await page.waitForTimeout(4000);
await page.screenshot({ path: out + '/polaroids2.png' });
await browser.close();
console.log('done');
