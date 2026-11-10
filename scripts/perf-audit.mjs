// 성능 실측(읽기 전용): 빌드 크기, 휴대폰 조건(390px, CPU 4배 느리게)의 첫 화면·메모리·슬라이더 반응, 브라우저 저장소 크기.
// 사용법: npm run build && node scripts/perf-audit.mjs [바퀴 수=3]
// 같은 PC에서도 첫 화면 시간은 크게 흔들린다. 메모리 기울기(바퀴마다 늘어나는 양)와 슬라이더 중간값을 전후 비교에 쓴다.
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const repo = fileURLToPath(new URL("..", import.meta.url));
const laps = Number(process.argv[2]) || 3;

// 1) 빌드 결과물
async function walk(d) {
  const out = [];
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push({ p: relative(join(repo, "out"), p).split("\\").join("/"), size: (await stat(p)).size });
  }
  return out;
}
const files = await walk(join(repo, "out"));
const js = files.filter((f) => f.p.endsWith(".js"));
const kb = (n) => (n / 1024).toFixed(0);
console.log(`[빌드] 파일 ${files.length}개, 전체 ${kb(files.reduce((n, f) => n + f.size, 0))}KB, JS ${js.length}개 ${kb(js.reduce((n, f) => n + f.size, 0))}KB`);

// 2) 실제 브라우저 실측
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain" };
const server = createServer(async (req, res) => {
  const p = new URL(req.url, "http://x").pathname;
  try {
    const b = await readFile(join(repo, "out", p === "/" ? "index.html" : p));
    res.writeHead(200, { "content-type": T[extname(p)] || "text/html" });
    res.end(b);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const cdp = await page.context().newCDPSession(page);
await cdp.send("Performance.enable");
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
const got = { n: 0, bytes: 0 };
page.on("response", async (r) => {
  try {
    got.bytes += (await r.body()).length;
    got.n++;
  } catch {}
});
const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
const t0 = Date.now();
await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: "load" });
await page.waitForSelector(".mi");
let m = await metrics();
console.log(`[첫 화면, CPU 4배 느리게] 표시까지 ${Date.now() - t0}ms, 받은 파일 ${got.n}개 ${kb(got.bytes)}KB(압축 전, 글꼴 포함), JS 메모리 ${(m.JSHeapUsedSize / 1048576).toFixed(1)}MB`);

// 3) 전 과정을 오가며 메모리가 계속 늘어나는지: 블록 9개 → 챕터 2의 레슨과 화면 부품 → 내 가방 → 홈
const heaps = [];
for (let lap = 0; lap < laps; lap++) {
  await page.locator(".mi").nth(0).click();
  for (let i = 0; i < 9; i++) {
    await page.locator(".part").nth(i).click();
    const opt = page.locator(".guess .opt").first();
    if (await opt.isEnabled()) await opt.click();
  }
  await page.locator(".brand").click();
  await page.locator(".mi").nth(5).click();
  const n = await page.locator(".parts .part").count();
  for (let i = 0; i < n; i++) {
    await page.locator(".parts .part").nth(i).click();
    const opt = page.locator(".guess .opt").first();
    if (await opt.isEnabled()) await opt.click();
    for (const [id, vals] of [["#memsim-bot", ["300", "700", "500"]], ["#nplus-n", ["50", "250", "100"]], ["#disk-used", ["40", "90", "72"]], ["#rate-n", ["30", "120", "60"]], ["#loop-step", ["0", "7", "4"]]])
      if (await page.locator(id).count()) for (const v of vals) await page.locator(id).fill(v);
  }
  for (const view of ["복습함", "수칙 카드", "질문 꾸러미"]) {
    await page.locator(".brand").click();
    const b = page.locator(".kit button", { hasText: view }).first();
    if (await b.count()) await b.click();
  }
  await page.locator(".brand").click();
  await cdp.send("HeapProfiler.collectGarbage").catch(() => {});
  m = await metrics();
  heaps.push(m.JSHeapUsedSize);
}
console.log(`[${laps}바퀴 왕복] JS 메모리 바퀴마다 ${heaps.map((h) => (h / 1048576).toFixed(1) + "MB").join(" → ")}, DOM 노드 ${m.Nodes}, 이벤트 리스너 ${m.JSEventListeners}`);

// 4) 슬라이더를 끌 때 한 번 반응에 걸리는 시간
await page.locator(".mi").nth(5).click();
await page.locator(".parts .part").nth(0).click();
const slider = await page.evaluate(async () => {
  const el = document.querySelector("#memsim-bot");
  if (!el) return null;
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  const times = [];
  for (let v = 250; v <= 800; v += 5) {
    const t = performance.now();
    set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => requestAnimationFrame(() => r()));
    times.push(performance.now() - t);
  }
  times.sort((a, b) => a - b);
  return { n: times.length, median: times[Math.floor(times.length / 2)], max: times[times.length - 1] };
});
if (slider) console.log(`[슬라이더 반응] ${slider.n}번: 중간값 ${slider.median.toFixed(1)}ms, 최대 ${slider.max.toFixed(1)}ms (한 프레임 16.7ms)`);

// 5) 브라우저 저장소
const ls = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k).length])));
console.log(`[브라우저 저장소] ${JSON.stringify(ls)} 합계 ${Object.values(ls).reduce((a, b) => a + b, 0)}자`);
await browser.close();
server.close();
