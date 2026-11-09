// 수강생 전 과정 검사: 실제 브라우저로 블록 → 실험실 → 유형·미션 → 번역기 → 공통 규칙 → 챕터를 끝까지 풀고,
// 화면마다 글자 대비(4.5 미만 실패)·가로 넘침·잘못된 글자·깨진 링크·콘솔 오류를 잰다.
// 동등성 검사는 프로토타입에 없는 요소(data-new)를 비교에서 빼므로, 그쪽 화면은 이 검사가 지킨다.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = join(root, "out", normalize(path === "/" ? "index.html" : path));
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
// APP_URL을 주면 로컬 out/ 대신 그 주소(예: 실제 배포)를 검사한다
const APP = process.env.APP_URL || `http://127.0.0.1:${server.address().port}/`;

const problems = [];
let screens = 0;

// 흐리게 보이는 것이 내용인 곳(꺼진 버튼, RLS로 가려진 줄, 봇이 멈춘 시간)은 대비 검사에서 뺀다
const audit = (page, label) =>
  page.evaluate((label) => {
    const lum = (c) => {
      const a = c.map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };
    const rgb = (s) => s.match(/[\d.]+/g)?.map(Number) ?? null;
    const bgOf = (el) => {
      for (let e = el; e; e = e.parentElement) {
        const c = rgb(getComputedStyle(e).backgroundColor);
        if (c && (c.length < 4 || c[3] > 0.5)) return c;
      }
      return [255, 255, 255];
    };
    const found = [];
    const vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > vw) found.push(`가로 넘침 ${document.documentElement.scrollWidth}px > ${vw}px`);
    for (const el of document.querySelectorAll(".wrap *")) {
      const box = el.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(" ");
      if (own) {
        const [fg, bg] = [rgb(getComputedStyle(el).color), bgOf(el)];
        const [a, b] = [lum(fg.slice(0, 3)), lum(bg.slice(0, 3))];
        const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        if (ratio < 4.5 && !el.closest("[disabled], .hide, .dead")) found.push(`대비 ${ratio.toFixed(2)}: ${own.slice(0, 30)}`);
        if (/undefined|\[object|NaN/.test(own)) found.push(`잘못된 글자: ${own.slice(0, 40)}`);
        if (box.right > vw + 1 && !el.closest(".tbl, .dbt, .term")) found.push(`화면 밖 글자: ${own.slice(0, 30)}`);
      }
      if (el.tagName === "BUTTON" && !el.textContent.trim()) found.push("빈 버튼");
      if (el.tagName === "A" && !/^https:\/\//.test(el.getAttribute("href") || "")) found.push(`잘못된 링크: ${el.getAttribute("href")}`);
    }
    return [...new Set(found)].map((f) => `${label}: ${f}`);
  }, label);

async function walk(viewport, colorScheme) {
  const tag = `${viewport.width}px ${colorScheme}`;
  const context = await browser.newContext({ viewport, colorScheme });
  const page = await context.newPage();
  page.on("pageerror", (e) => problems.push(`${tag}: 페이지 오류 ${e.message}`));
  page.on("console", (m) => m.type() === "error" && problems.push(`${tag}: 콘솔 오류 ${m.text()}`));
  const check = async (label) => {
    screens++;
    problems.push(...(await audit(page, `${tag} ${label}`)));
  };
  const expect = (ok, what) => ok || problems.push(`${tag}: ${what}`);
  const button = (t) => page.locator("button", { hasText: t }).first();
  const text = (sel) => page.locator(sel).first().innerText();

  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForSelector(".mi");
  await check("홈");

  // 블록 9개와 실험실: 보이는 실험실 버튼을 전부 눌러 본다
  await page.locator(".mi").nth(0).click();
  for (let i = 0; i < 9; i++) {
    const name = await text(".bhead h2");
    await page.locator(".guess .opt").first().click();
    await check(`블록 ${name}`);
    for (let round = 0; round < 2; round++) {
      const n = await page.locator("#lab button").count();
      for (let k = 0; k < n; k++) {
        const b = page.locator("#lab button").nth(k);
        if ((await b.count()) && (await b.isEnabled())) await b.click();
      }
      await check(`실험실 ${name}`);
    }
    await button(i < 8 ? "다음 블록" : "만들 것 고르기").click();
  }

  // 유형 7개: 조립도 → 순서 → 미션 전부 → 완료 표시
  const types = await page.locator(".type").count();
  for (let i = 0; i < types; i++) {
    await page.locator(".type").nth(i).click();
    const name = await text(".eyebrow");
    await check(`${name} 조립도`);
    await button("돌아가는 순서 보기").click();
    await check(`${name} 순서`);
    await button("AI 감독 미션 시작").click();
    for (;;) {
      await page.locator(".page .opt").first().click();
      await check(`${name} 미션`);
      if (await button("다음 미션").count()) await button("다음 미션").click();
      else break;
    }
    await button("완료하고 다른 것 고르기").click();
    expect((await page.locator(".type.done").count()) === i + 1, `${name} 완료 표시 안 됨`);
  }

  // 번역기: 칩마다 항목이 나오고, 항목마다 출처 링크가 있다
  await page.locator(".brand").click();
  expect((await text(".mi:nth-child(1) i")) === "9/9", "블록 진도가 9/9가 아님");
  await page.locator(".mi").nth(2).click();
  const chips = await page.locator(".chip").count();
  for (let i = 0; i < chips; i++) {
    await page.locator(".chip").nth(i).click();
    const label = await page.locator(".chip").nth(i).innerText();
    expect((await page.locator(".ph").count()) > 0, `번역기 칩 ${label} 항목 없음`);
    // 항목마다 출처 링크가 1개 이상 있어야 한다 (한 항목에 출처가 여러 개일 수 있다)
    const noLink = await page.locator(".ph").evaluateAll((items) => items.filter((p) => !p.querySelector(".src a")).length);
    expect(noLink === 0, `번역기 칩 ${label} 출처 없는 항목 ${noLink}개`);
    await check(`번역기 ${label}`);
  }

  // 공통 규칙
  await page.locator(".brand").click();
  await page.locator(".mi").nth(3).click();
  await check("공통 규칙");
  await button("처음으로").click();

  // 챕터 레슨 4개
  await page.locator(".mi").nth(4).click();
  for (let i = 0; i < 4; i++) {
    const name = await text(".bhead h2");
    await page.locator(".guess .opt").first().click();
    await check(`챕터 ${name}`);
    if (i < 3) await button("다음 레슨").click();
  }

  // 금액 실험실: 칸을 고치면 미리보기가 따라오고, 지난 결과는 사라진다
  await page.locator(".brand").click();
  await page.locator(".mi").nth(0).click();
  await page.locator(".part").nth(1).click();
  // 이미 푼 블록: 다시 열어도 설명과 실험실이 열려 있고, 보기는 다시 누를 수 없다
  expect((await page.locator(".lock").count()) === 0, "이미 푼 블록을 다시 열었는데 설명이 잠김");
  expect(await page.locator(".guess .opt").first().isDisabled(), "이미 푼 블록의 보기를 다시 누를 수 있음");
  await button("주문서 보내기").click();
  expect((await page.locator("#lab .out").count()) === 1, "금액 실험실 결과가 안 나옴");
  await page.locator("#amt").fill("500");
  expect((await text("#lab .term")).includes('"amount": 500'), "금액을 고쳐도 미리보기가 그대로");
  expect((await page.locator("#lab .out").count()) === 0, "금액을 고쳐도 지난 결과가 남음");
  expect(await page.locator("#amt").evaluate((e) => e === document.activeElement), "입력 중 금액 칸 포커스가 사라짐");
  await page.keyboard.type("1");
  expect((await page.locator("#amt").inputValue()) === "5001", "이어서 입력하면 금액 칸 값이 사라짐");
  await page.locator("#amt").fill("500");
  await button("주문서 보내기").click();
  expect((await text("#lab .out")).includes("500원에 팔렸어요"), "고친 금액으로 결과가 안 나옴");

  // 뒤로가기: 사이트 밖으로 나가지 않고 앞 화면으로 돌아간다
  await page.locator(".part").nth(2).click();
  expect((await text(".bhead h2")) === "기록장", "블록 이동 실패");
  const scoreBefore = await text("#score");
  await page.evaluate(() => (window.__sameDocument = true));
  await page.goBack();
  expect((await text(".bhead h2")) === "서버", "뒤로가기가 이전 블록으로 안 감");
  await page.goBack();
  expect((await text(".bhead h2")) === "화면", "뒤로가기가 첫 블록으로 안 감");
  await page.goBack();
  expect((await page.locator(".mi").count()) === 5, "뒤로가기가 홈으로 안 감");
  expect(page.url().startsWith(APP), "뒤로가기로 사이트를 벗어남");
  expect(await page.evaluate(() => window.__sameDocument === true), "뒤로가기 때 페이지가 새로고침됨");
  expect((await text("#score")) === scoreBefore, "뒤로가기 후 점수가 사라짐");
  await page.goForward();
  expect((await page.locator(".part").count()) === 9, "앞으로가기가 레슨으로 안 감");

  // 점수는 첫 답만 센다: 열쇠 실험실을 다시 풀어도 점수가 그대로다
  const firstScore = await text("#score");
  await page.locator(".part").nth(5).click();
  // 앞에서 첫 칸은 정답("화면에 둬도 됨")으로 채점됐다. 이번에는 다른 답을 눌러도 점수가 그대로여야 한다
  await page.locator("#lab .tog").nth(1).click();
  expect((await text("#score")) === firstScore, `다시 푼 문제가 점수에 또 들어감 (${firstScore} → ${await text("#score")})`);
  const m = firstScore.match(/(\d+) \/ (\d+)/);
  // 맞혀보기 9 + 열쇠 6 + 미션 17 + 챕터 4 = 36문제
  expect(m && m[2] === "36", `첫 답 문제 수가 36이 아님: ${firstScore}`);

  // 새로고침해도 진도와 점수는 남는다
  await page.reload();
  await page.waitForSelector(".mi");
  expect((await text(".mi:nth-child(2) i")) === "7/7", "새로고침 후 유형 진도가 사라짐");
  expect((await text("#score")) === firstScore, "새로고침 후 점수가 사라짐");
  await context.close();
}

const browser = await chromium.launch();
// 다크는 기기 설정만 다크로 켠 것이다. 지금 사이트는 라이트로 고정이라 화면이 달라지면 안 된다 (Android 강제 다크는 실제 기기로만 확인 가능)
for (const [viewport, scheme] of [[{ width: 375, height: 812 }, "light"], [{ width: 375, height: 812 }, "dark"], [{ width: 1280, height: 900 }, "light"]]) await walk(viewport, scheme);
await browser.close();
server.close();

const unique = [...new Set(problems)];
for (const p of unique) console.log(`✗ ${p}`);
console.log(`\n수강생 전 과정 검사: 화면 ${screens}곳, 문제 ${unique.length}건`);
process.exit(unique.length ? 1 : 0);
