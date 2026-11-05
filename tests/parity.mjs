// 화면 동등성 검사: 프로토타입 v4 HTML과 새 앱(out/)을 실제 브라우저에서 같은 순서로 조작하고,
// 매 단계 화면 구조(태그·클래스·비활성 여부·링크·스타일·입력값)와 보이는 글자를 비교한다.
// 사용법: npm run build && node tests/parity.mjs   (Playwright + Chromium 필요)
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(root, "out");
const PROTO = "file://" + join(root, "prototype/code-block-classroom-prototype-v4.html");
if (!existsSync(OUT)) throw new Error("out/ 폴더가 없습니다. 먼저 npm run build");

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain", ".ico": "image/x-icon", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  let p = join(OUT, decodeURIComponent(req.url.split("?")[0]));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
  if (!existsSync(p)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" }).end(readFileSync(p));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
// APP_URL을 주면 로컬 out/ 대신 그 주소(예: 실제 배포)를 프로토타입과 비교한다
const APP = process.env.APP_URL || `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
// 외부 글꼴 요청은 막는다 (비교 대상 아님, 네트워크 정책상 막혀 있을 수 있음)
async function open(url) {
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 } });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && !/fonts\.googleapis|ERR_FAILED/.test(m.text()) && errors.push(m.text()));
  await page.goto(url);
  await page.waitForSelector(".wrap #app .page");
  await page.waitForTimeout(50);
  return { page, ctx, errors };
}

// 승인된 문장 변경(docs/content-port-report.md 8절). 프로토타입 쪽 글자를 바꿔서 새 앱과 비교한다.
const INTENDED_TEXT = [
  ["Supabase는 anon, service_role 키를 2026년 말까지 없앨 예정이라고 안내해요.", "Supabase는 anon, service_role 키를 2026년 말까지 지원 중단(deprecate)할 예정이라고 안내해요. 새 키를 만들어도 예전 키는 직접 끄기 전까지는 계속 동작해요."],
  ["회사 숫자처럼 남이 보면 안 되면 꼭 필요해요.", "회사 숫자처럼 남이 보면 안 되는 숫자면 필요해요. 나만 보는 숫자면 없어도 돼요."],
  ["교육용 프로토타입 · 모든 설명은 화면 아래 표시한 공식 문서로 2026-10-09에 확인 · 실험은 실제 서비스가 아닌 시뮬레이션", "교육용 프로토타입 · 설명은 화면 아래 표시한 공식 문서로 2026-11-05에 확인, 비유·일반 설명은 '출처 없음'으로 표시 · 실험은 실제 서비스가 아닌 시뮬레이션"],
  ["(2026-10-09 확인)", "(2026-11-05 확인)"],
  // 과제 2: 비유 보충 — 설명 단락의 보충 <p>는 data-new로 제외하고, 맞혀보기 해설(repo)은 글자 치환으로 비교
  ["세이브를 안 했다면 돌아갈 곳이 없어요.", "세이브를 안 했다면 돌아갈 곳이 없어요. 실제로는 커밋은 그 시점 파일 전체의 모습을 '스냅샷'으로 저장해 두는 거예요."],
  // 신규 챕터 번역기 5개가 더해져 홈 메뉴의 개수 문구가 바뀜
  ["AI가 자주 하는 말 19개", "AI가 자주 하는 말 24개"],
  // 미결 과제 3·7 (10·12절): SNS 미션 2 질문과 해설
  ["내 인스타 게시물을 홈페이지에 자동으로 띄우려면 인스타 계정이 어떤 종류여야 할까?", "내 인스타 계정을 Instagram API로 연결하려면 계정이 어떤 종류여야 할까?"],
  ["Meta 문서의 Instagram API는 비즈니스 또는 크리에이터 계정을 요구해요. 개인 계정이면 먼저 전환해야 해요.", "Meta 문서는 Instagram API의 두 방식(Instagram 로그인, Facebook 로그인) 모두 비즈니스 또는 크리에이터 계정을 관리하는 기능이라고 설명해요. Facebook 로그인 방식 문서에는 소비자 계정에 접근할 수 없다고 적혀 있어요. 공개 게시물을 웹사이트에 넣는 '퍼가기'는 따로 있어요. 비공개·비활성·연령 제한 계정의 게시물과 퍼가기를 끈 계정은 지원되지 않아요."],
];
const applyIntended = (snap) => {
  for (const [from, to] of INTENDED_TEXT) snap.text = snap.text.split(from).join(to);
  return snap;
};

function snapshot(page, dropBrandVersion = false) {
  return page.evaluate((dropBrandVersion) => {
    const ATTRS = ["id", "href", "target", "rel", "type", "for", "aria-label"];
    const ser = (el) => {
      if (el.nodeType !== 1) return null;
      const o = { t: el.tagName.toLowerCase() };
      const cls = [...el.classList].sort().join(" ");
      if (cls) o.c = cls;
      for (const a of ATTRS) if (el.hasAttribute(a)) o[a] = el.getAttribute(a === "for" ? "for" : a);
      if (el.style && el.style.cssText) o.s = el.style.cssText;
      if (el.disabled) o.d = 1;
      if (el.tagName === "INPUT") o.v = el.value;
      const kids = [...el.childNodes].map(ser).filter(Boolean);
      if (kids.length) o.k = kids;
      return o;
    };
    // 출처 표시(.src, .srclist)는 이식 후 의도적으로 달라졌다(출처 교체·2차 배지·출처 없음 표시).
    // 그 부분은 check-sources·verify-port가 검증하므로 화면 비교에서는 뺀다.
    const wrap = document.querySelector(".wrap").cloneNode(true);
    wrap.querySelectorAll(".src, .srclist").forEach((e) => e.remove());
    // 프로토타입에 없는 새 요소(신규 챕터 메뉴·칩·번역기 항목)는 data-new로 표시돼 있어 비교에서 뺀다
    wrap.querySelectorAll("[data-new]").forEach((e) => e.remove());
    // 미결 과제 6 (11절): 머리글의 "프로토타입 v3" 표기를 앱에서 없앴다. 프로토타입 쪽에서만 지워서, 앱에 다시 생기면 실패하게 둔다
    if (dropBrandVersion) wrap.querySelectorAll(".brand small").forEach((e) => e.remove());
    document.body.appendChild(wrap);
    const out = { tree: JSON.stringify(ser(wrap)), text: wrap.innerText.replace(/\s+/g, " ").trim() };
    wrap.remove();
    return out;
  }, dropBrandVersion);
}

// 두 페이지에 같은 조작을 하는 도구
const act = {
  click: (sel, n = 0) => async (p) => p.locator(sel).nth(n).click(),
  text: (sel, t, n = 0) => async (p) => p.locator(sel, { hasText: t }).nth(n).click(),
  fill: (sel, v) => async (p) => p.locator(sel).fill(v),
  type: (sel, v) => Object.assign(async (p) => {
    await p.locator(sel).click({ clickCount: 3 });
    await p.keyboard.type(v);
  }, { skipCompare: true }), // 금액 입력 직후는 앱이 일부러 다르다 (미리보기 갱신, 지난 결과 삭제). tests/walkthrough.mjs가 검사한다
  reload: () => async (p) => {
    await p.reload();
    await p.waitForSelector(".wrap #app .page");
    await p.waitForTimeout(50);
  },
};
const toLesson = (bi) => [act.click(".mi", 0), act.click(".part", bi)];
const answerHook = (o) => act.click(".guess .opt", o);

// 원본 데이터(정답 번호, 옵션 개수)는 content JSON에서 읽는다
const J = (rel) => JSON.parse(readFileSync(join(root, "content", rel), "utf8"));
const order = J("blocks/order.json");
const blocks = order.map((id) => J(`blocks/${id}.json`));
const types = J("types/order.json").map((id) => J(`types/${id}.json`));

const scenarios = [];
const S = (name, steps) => scenarios.push({ name, steps });

S("홈", []);
S("머리글 눌러 홈으로", [act.click(".mi", 2), act.click(".brand")]);
blocks.forEach((b, bi) => {
  b.hook.opts.forEach((_, o) => S(`블록 ${b.id} 맞혀보기 ${o}`, [...toLesson(bi), answerHook(o)]));
});
S("블록 이전/다음 이동", [...toLesson(0), answerHook(1), act.text(".row .btn", "다음 블록"), answerHook(0), act.text(".row .btn", "이전 블록")]);
S("마지막 블록 → 만들 것 고르기", [...toLesson(8), answerHook(1), act.text(".row .btn", "만들 것 고르기")]);

const lab = (bi, steps) => [...toLesson(bi), answerHook(blocks[bi].hook.a), ...steps];
const L = "#lab";
S("실험실 ui", lab(0, [act.click(`${L} .shop .btn`), ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => act.click(`${L} .term .ln`, i)), act.click(`${L} .shop .btn`), act.click(`${L} .shop .btn`)]));
S("실험실 server", lab(1, [
  act.text(`${L} .btn`, "주문서 보내기"),
  act.type(`${L} #amt`, "500"),
  act.text(`${L} .btn`, "주문서 보내기"),
  act.text(`${L} .tog`, "켬"),
  act.text(`${L} .btn`, "주문서 보내기"),
  act.type(`${L} #amt`, "9900"),
  act.text(`${L} .btn`, "주문서 보내기"),
  act.type(`${L} #amt`, "12345"),
  act.text(`${L} .tog`, "끔"),
  act.text(`${L} .btn`, "주문서 보내기"),
  act.type(`${L} #amt`, ""),
  act.text(`${L} .btn`, "주문서 보내기"),
]));
const dbSteps = [];
for (const r of ["끔", "켬"]) for (const w of ["준호", "서연", "로그인 안 함", "민지"]) dbSteps.push(act.text(`${L} .tog`, w), act.text(`${L} .tog`, r));
S("실험실 db", lab(2, dbSteps));
S("실험실 auth", lab(3, [act.click(`${L} .tog`, 2), act.click(`${L} .tog`, 1), act.click(`${L} .tog`, 3), act.click(`${L} .tog`, 0)]));
S("실험실 ext", lab(4, [act.text(`${L} .btn`, "요청 보내기"), act.text(`${L} .tog`, "빼기"), act.text(`${L} .btn`, "요청 보내기"), act.text(`${L} .tog`, "넣기")]));
S("실험실 key 오답섞기", lab(5, [0, 0, 1, 0, 1, 0].map((j, i) => act.click(`${L} .kc:nth-child(${i + 1}) .tog`, j))));
S("실험실 key 전부정답", lab(5, [0, 1, 0, 1, 1, 1].map((j, i) => act.click(`${L} .kc:nth-child(${i + 1}) .tog`, j))));
S("실험실 host", lab(6, [act.text(`${L} .btn`, "배포하기")]));
S("실험실 always", lab(7, [act.text(`${L} .tog`, "클라우드 가상 서버"), act.text(`${L} .tog`, "내 노트북")]));
S("실험실 repo", lab(8, [act.text(`${L} .btn`, "AI에게 대규모 수정"), act.click(`${L} .cm`, 0), act.click(`${L} .cm`, 1), act.text(`${L} .btn`, "AI에게 대규모 수정"), act.click(`${L} .cm`, 2)]));

types.forEach((t, ti) => {
  const open = [act.click(".mi", 1), act.click(".type", ti)];
  S(`유형 ${t.id} 조립도 블록 눌러 수업으로`, [...open, act.click(".asm .brickbtn", 0)]);
  S(`유형 ${t.id} 탭 이동`, [...open, act.text(".page > .btn", "돌아가는 순서 보기"), act.click(".tabs button", 0), act.click(".tabs button", 2), act.click(".tabs button", 1), act.text(".page > .btn", "AI 감독 미션 시작")]);
  for (const o of [0, 1, 2]) {
    const steps = [...open, act.click(".tabs button", 2)];
    t.missions.forEach((m, mi) => {
      const n = m.k === "ai" ? 2 : m.opts.length;
      steps.push(act.click(".page .opt", Math.min(o, n - 1)));
      steps.push(act.text(".page > .btn", mi < t.missions.length - 1 ? "다음 미션" : "완료하고 다른 것 고르기"));
    });
    steps.push(act.click(".brand"));
    S(`유형 ${t.id} 미션 전부 (보기 ${o})`, steps);
  }
});
S("유형 고르기 → 블록 배우기 버튼", [act.click(".mi", 1), act.text(".note .btn", "블록 9개 배우기")]);

const chips = ["전체", "⚠ 조심할 말", ...blocks.map((b) => b.name)];
S("AI 말 번역기 필터 전부", [act.click(".mi", 2), ...chips.map((c) => act.text(".chip", c))]);
S("공통 규칙 → 처음으로", [act.click(".mi", 3), act.text(".btn", "처음으로")]);
S("진도 저장 후 새로고침", [
  ...toLesson(0), answerHook(1), act.click(".part", 3), answerHook(0),
  act.click(".brand"), act.click(".mi", 1), act.click(".type", 1), act.click(".tabs button", 2),
  act.click(".page .opt", 0), act.text(".page > .btn", "다음 미션"), act.click(".page .opt", 0), act.text(".page > .btn", "완료하고 다른 것 고르기"),
  act.reload(),
  act.click(".mi", 1),
]);

let fail = 0, checks = 0;
const failures = [];
const only = process.env.ONLY;
for (const sc of scenarios.filter((x) => !only || x.name.includes(only))) {
  const A = await open(PROTO), B = await open(APP);
  let stepNo = 0;
  const compare = async () => {
    const [a, b] = [applyIntended(await snapshot(A.page, true)), await snapshot(B.page)];
    checks++;
    if (a.tree !== b.tree || a.text !== b.text) {
      fail++;
      const at = a.text, bt = b.text;
      let i = 0;
      while (i < at.length && at[i] === bt[i]) i++;
      let j = 0;
      while (j < a.tree.length && a.tree[j] === b.tree[j]) j++;
      failures.push(`✗ ${sc.name} / 단계 ${stepNo}\n   글자 차이 위치 ${i}: 원본 «${at.slice(Math.max(0, i - 40), i + 60)}»\n                     새앱 «${bt.slice(Math.max(0, i - 40), i + 60)}»\n   구조 차이: 원본 «${a.tree.slice(Math.max(0, j - 80), j + 120)}»\n             새앱 «${b.tree.slice(Math.max(0, j - 80), j + 120)}»`);
      return false;
    }
    return true;
  };
  let ok = await compare();
  for (const step of sc.steps) {
    if (!ok) break;
    stepNo++;
    await step(A.page);
    await step(B.page);
    await A.page.waitForTimeout(20);
    await B.page.waitForTimeout(20);
    ok = step.skipCompare ? true : await compare();
  }
  if (B.errors.length) {
    fail++;
    failures.push(`✗ ${sc.name}: 새 앱 콘솔 오류 ${B.errors.join(" | ")}`);
  }
  await A.ctx.close();
  await B.ctx.close();
}
await browser.close();
server.close();
if (failures.length) console.log(failures.join("\n"));
console.log(`\n화면 동등성 검사: 시나리오 ${scenarios.length}개, 비교 ${checks}회, 실패 ${fail}건`);
process.exit(fail ? 1 : 0);
