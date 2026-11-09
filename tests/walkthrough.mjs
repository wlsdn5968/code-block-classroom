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
        // <code> 안의 글자는 콘텐츠가 일부러 보여 주는 코드 예시다(예: 레슨 '못 읽은 값은 0이 아니다'의 100 + undefined)
        if (/undefined|\[object|NaN/.test(own) && el.tagName !== "CODE") found.push(`잘못된 글자: ${own.slice(0, 40)}`);
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

  // 챕터 2개(홈 5·6번)의 레슨을 끝까지 푼다. 그림 부품이 있으면 조작해 본다
  for (const menu of [4, 5]) {
    if (menu === 5) await page.locator(".brand").click();
    await page.locator(".mi").nth(menu).click();
    const lessons = await page.locator(".parts .part").count();
    for (let i = 0; i < lessons; i++) {
      const name = await text(".bhead h2");
      await page.locator(".guess .opt").first().click();
      await check(`챕터 ${name}`);
      if (await page.locator("#memsim-bot").count()) {
        await page.locator(".sec .lab .tog", { hasText: "켬" }).first().click();
        // 기준: 봇 425MB일 때 여유 210MB. 테스트 190MB를 켜면 210 - 190 = 20MB가 남는다
        expect((await text(".sec .lab .out")).includes("여유 메모리 20MB"), "메모리 시뮬레이션: 테스트 작업을 켰을 때 여유 20MB가 아님");
        await page.locator("#memsim-bot").fill("800");
        expect((await text(".sec .lab .out")).includes("모자라요"), "메모리 시뮬레이션: 봇 800MB에서 부족 표시가 없음");
        await check(`챕터 ${name} 메모리 시뮬레이션`);
      }
      if (await page.locator("#nplus-n").count()) {
        // 기준: 47종목이면 따로 329번 11.7초, 묶어서 7번 1.1초
        expect((await text(".sec .lab .cmpbars")).includes("11.7초"), "따로 묻기 시뮬레이션: 47종목 기준 11.7초가 아님");
        await page.locator("#nplus-n").fill("300");
        expect((await text(".sec .lab .out")).includes("배"), "따로 묻기 시뮬레이션: 비교 문구가 없음");
        await check(`챕터 ${name} 따로 묻기 시뮬레이션`);
      }
      if (await page.locator("#disk-gb").count()) {
        // 기준: 8.7GB, 72%, 하루 100MB → 남은 2.4GB, 24일 (기록의 약 3주)
        expect((await text(".sec .lab .out")).includes("24일"), "디스크 계산기: 기본값에서 24일이 아님");
        await page.locator("#disk-used").fill("95");
        await check(`챕터 ${name} 디스크 계산기`);
      }
      if (await page.locator("[data-k=naive]").count()) {
        // 기준: A 300 + B 500 + C 200 = 1,000만 원. B를 못 읽으면 ①은 500만 원(50% 감소)으로 경보, ②는 계산 보류
        await page.locator(".sec .lab .tog", { hasText: "읽음(500만 원)" }).click(); // 배지 "0과 모름"은 세 상태를 모두 직접 눌러야 한다
        await page.locator(".sec .lab .tog", { hasText: "못 읽음" }).click();
        expect((await text("[data-k=naive]")).includes("경보"), "못 읽은 값 비교: ①에서 경보가 없음");
        expect((await text("[data-k=careful]")).includes("보류"), "못 읽은 값 비교: ②에서 보류가 없음");
        await page.locator(".sec .lab .tog", { hasText: "정말 0원" }).click();
        expect((await text("[data-k=careful]")).includes("경보가 맞아요"), "못 읽은 값 비교: 정말 0원일 때 ②에서 경보가 없음");
        await check(`챕터 ${name} 못 읽은 값 비교`);
      }
      if (await page.locator("#rate-n").count()) {
        // 기준: 한도 60번. 40번이면 20번 더 보낼 수 있고, 100번이면 40번이 거절된다
        expect((await text(".sec .lab .out")).includes("20번"), "속도 제한 계산: 40번일 때 남은 20번이 아님");
        await page.locator("#rate-n").fill("100");
        expect((await text(".sec .lab .out")).includes("40번"), "속도 제한 계산: 100번일 때 거절 40번이 아님");
        await check(`챕터 ${name} 속도 제한 계산`);
      }
      if (await page.locator("#loop-step").count()) {
        // 기준: 60초마다 → 30일 43,200번 × 10원 = 432,000원. 1초마다 → 2,592,000번
        expect((await text(".sec .lab .out")).includes("43,200번"), "반복 호출 계산: 60초마다 43,200번이 아님");
        await page.locator("#loop-step").fill("0");
        expect((await text(".sec .lab .out")).includes("2,592,000번"), "반복 호출 계산: 1초마다 2,592,000번이 아님");
        await check(`챕터 ${name} 반복 호출 계산`);
      }
      if (await page.locator("[data-k=left]").count()) {
        // 기준: 5건 중 '취소' 2건. WHERE 있음+COMMIT → 3건, WHERE 없음 → 0건, ROLLBACK → 5건
        expect((await text("[data-k=left]")).includes("3건"), "삭제 미리보기: WHERE 있음에서 3건이 아님");
        await page.locator(".sec .lab .tog", { hasText: "WHERE 없음" }).click();
        expect((await text("[data-k=left]")).includes("0건"), "삭제 미리보기: WHERE 없음에서 0건이 아님");
        await page.locator(".sec .lab .tog", { hasText: "ROLLBACK" }).click();
        expect((await text("[data-k=left]")).includes("5건"), "삭제 미리보기: ROLLBACK에서 5건이 아님");
        await check(`챕터 ${name} 삭제 미리보기`);
      }
      if (await page.locator("[data-k=posts]").count()) {
        // 기준: 키 없이 한 번 더 보내면 게시물 2개, 키가 있으면 다시 보내도 1개
        await page.locator(".sec .lab .tog", { hasText: "같은 요청 다시 보내기" }).click();
        expect((await text("[data-k=posts]")).includes("2개"), "재시도 흉내: 키 없이 다시 보내도 2개가 아님");
        await page.locator(".sec .lab .tog", { hasText: "있음" }).click();
        await page.locator(".sec .lab .tog", { hasText: "같은 요청 다시 보내기" }).click();
        expect((await text("[data-k=posts]")).includes("1개"), "재시도 흉내: 키가 있는데 1개가 아님");
        await check(`챕터 ${name} 재시도 흉내`);
      }
      if (i < lessons - 1) await button("다음 레슨").click();
    }
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
  expect((await page.locator(".mi").count()) === 6, "뒤로가기가 홈으로 안 감");
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
  // 맞혀보기 9 + 열쇠 6 + 미션 17 + 챕터 레슨(AI와 일하는 법 4, 만든 다음에 터지는 것들 8) = 44문제
  expect(m && m[2] === "44", `첫 답 문제 수가 44가 아님: ${firstScore}`);

  // 새로고침해도 진도와 점수는 남는다
  await page.reload();
  await page.waitForSelector(".mi");
  expect((await text(".mi:nth-child(2) i")) === "7/7", "새로고침 후 유형 진도가 사라짐");
  expect((await text("#score")) === firstScore, "새로고침 후 점수가 사라짐");

  // 게임 뼈대 (기획서 v2 M1): 지도·레벨·배지·진도 파일
  expect((await page.locator(".qmap .region").count()) === 4, "학습 지도 지역이 4개가 아님");
  expect((await page.locator(".qmap .cell").count()) === 9 + 7 + 4 + 1 + 8, "학습 지도 칸 수가 29가 아님(번역기 칸 포함)");
  await page.locator(".lvl").click();
  await check("내 기록");
  const [right, total] = [Number(m[1]), Number(m[2])];
  const xp = right * 10 + (total - right) * 3; // content/game/levels.json의 xp 값
  expect((await text(".xpnote")).startsWith(`${xp} XP`), `경험치가 점수와 안 맞음: 기대 ${xp}, 화면 "${await text(".xpnote")}"`);
  const on = await page.locator(".badge.on").evaluateAll((els) => els.map((e) => e.dataset.badge));
  // 이 검사가 앞에서 실제로 한 행동으로 얻는 배지
  for (const id of ["blocks", "types", "ops", "memory", "nullzero", "rollback", "retry", "danger", "words"]) expect(on.includes(id), `배지 ${id}가 켜지지 않음 (켜진 것: ${on.join(",")})`);
  expect(!on.includes("comeback"), "아직 열리지 않은 배지 '다시 일어서기'가 켜짐");
  expect((await page.locator(".badge").count()) === 12, "배지가 12개가 아님");
  // 진도 파일: 저장 → 기록 지우기 → 잘못된 파일 거부 → 불러오기
  const [dl] = await Promise.all([page.waitForEvent("download"), button("진도 파일 저장").click()]);
  const savedPath = await dl.path();
  const saved = JSON.parse(await readFile(savedPath, "utf8"));
  expect(saved.kind === "code-block-classroom-progress" && Object.keys(saved.answers).length === total, "진도 파일 내용이 기록과 다름");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector(".mi");
  expect((await text("#score")) === "정답 0 / 0", "기록을 지웠는데 점수가 남음");
  await page.locator(".lvl").click();
  await page.locator(".page input[type=file]").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from('{"kind":"other"}') });
  await page.locator(".page .out", { hasText: "아무것도 바꾸지 않았어요" }).waitFor({ timeout: 5000 }).catch(() => {}); // 파일 읽기는 비동기라 결과를 기다린다
  expect((await text(".page .out")).includes("아무것도 바꾸지 않았어요"), "다른 파일을 불러왔는데 거부하지 않음");
  expect((await text("#score")) === "정답 0 / 0", "잘못된 파일로 점수가 바뀜");
  await page.locator(".page input[type=file]").setInputFiles(savedPath);
  await page.locator(".page .out", { hasText: "합쳤어요" }).waitFor({ timeout: 5000 }).catch(() => {}); // 파일 읽기는 비동기라 결과를 기다린다
  expect((await text(".page .out")).includes("합쳤어요"), "진도 파일을 불러오지 못함");
  expect((await text("#score")) === firstScore, `불러온 뒤 점수가 다름 (${await text("#score")})`);
  expect((await page.locator(".badge.on").count()) === on.length, "불러온 뒤 배지 수가 다름");
  await page.locator(".toast button").waitFor({ timeout: 5000 }).catch(() => {});
  expect((await page.locator(".toast button").count()) === 1, "배지를 새로 얻었는데 알림이 안 뜸");
  // 빈 진도 파일은 지금 기록을 지우지 않는다(합치기). 칸이 빠진 파일은 거부한다
  const empty = { kind: "code-block-classroom-progress", v: 1, answers: {}, done: {}, seen: {}, cseen: {}, game: {} };
  await page.locator(".page input[type=file]").setInputFiles({ name: "empty.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(empty)) });
  await page.locator(".page .out", { hasText: "새로 더할 기록은 없었어요" }).waitFor({ timeout: 5000 }).catch(() => {});
  expect((await text(".page .out")).includes("새로 더할 기록은 없었어요"), "빈 진도 파일 결과 문구가 다름");
  expect((await text("#score")) === firstScore, "빈 진도 파일을 불러오자 기록이 지워짐");
  await page.locator(".page input[type=file]").setInputFiles({ name: "partial.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ kind: "code-block-classroom-progress", v: 1 })) });
  await page.locator(".page .out", { hasText: "아무것도 바꾸지 않았어요" }).waitFor({ timeout: 5000 }).catch(() => {});
  expect((await text(".page .out")).includes("아무것도 바꾸지 않았어요"), "칸이 빠진 진도 파일을 거부하지 않음");
  expect((await text("#score")) === firstScore, "칸이 빠진 진도 파일로 기록이 바뀜");
  await check("내 기록 불러온 뒤");
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
