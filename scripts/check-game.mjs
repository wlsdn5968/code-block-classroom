// 게임 규칙 검사 (기획서 v2 M1, 빌드 전 실행): content/game/*.json의 실수를 빌드에서 막는다.
//  - 레벨: 첫 기준값 0, 기준값이 커지는 순서, 이름·뜻이 비어 있지 않음, 경험치 값이 양의 정수
//  - 배지: id 중복 없음, 이름·설명·아이콘 있음, 판정 종류가 알려진 것, event는 lib/store.ts의 GAME_EVENTS에 있는 것, chapter는 있는 챕터
import { readFileSync } from "node:fs";

const read = (rel) => JSON.parse(readFileSync(new URL(`../${rel}`, import.meta.url), "utf8"));
const errors = [];
const lv = read("content/game/levels.json");
for (const k of ["correct", "tried", "review"]) if (!Number.isInteger(lv.xp?.[k]) || lv.xp[k] <= 0) errors.push(`levels.json xp.${k}는 양의 정수`);
if (!(lv.xp?.tried < lv.xp?.correct)) errors.push("levels.json: 틀렸을 때(tried) 경험치는 맞혔을 때(correct)보다 작아야 함");
if (!Array.isArray(lv.levels) || lv.levels.length < 2) errors.push("levels.json levels는 2개 이상");
else {
  if (lv.levels[0].min !== 0) errors.push("levels.json 첫 레벨 min은 0");
  lv.levels.forEach((l, i) => {
    if (!l.name || !l.mean) errors.push(`레벨 ${i + 1}: name·mean 필요`);
    if (i && !(l.min > lv.levels[i - 1].min)) errors.push(`레벨 ${i + 1}: min이 앞 레벨보다 커야 함`);
  });
}

const store = readFileSync(new URL("../lib/store.ts", import.meta.url), "utf8");
const events = [...(store.match(/GAME_EVENTS = \[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
if (!events.length) errors.push("lib/store.ts에서 GAME_EVENTS를 찾지 못함");
// 챕터 id는 lib/content.ts의 makeChapter("id", ...) 호출에서 읽는다 (화면에 실제로 있는 챕터)
const contentTs = readFileSync(new URL("../lib/content.ts", import.meta.url), "utf8");
const chapters = [...contentTs.matchAll(/makeChapter\("([^"]+)"/g)].map((m) => m[1]);
if (!chapters.length) errors.push("lib/content.ts에서 챕터(makeChapter)를 찾지 못함");
const KINDS = ["blocks", "mission", "types", "words", "chapter", "event", "review"];
const badges = read("content/game/badges.json");
const ids = new Set();
for (const b of badges) {
  const w = `배지 ${b.id ?? "(id 없음)"}`;
  if (!b.id || ids.has(b.id)) errors.push(`${w}: id가 없거나 중복`);
  ids.add(b.id);
  if (!b.name || !b.how || !b.ico) errors.push(`${w}: name·how·ico 필요`);
  const k = b.rule?.kind;
  if (!KINDS.includes(k)) errors.push(`${w}: 판정 종류 "${k}"는 ${KINDS.join("/")} 중 하나`);
  if (k === "event" && !events.includes(b.rule.id)) errors.push(`${w}: 사건 "${b.rule.id}"가 GAME_EVENTS에 없음`);
  if (k === "review" && !(Number.isInteger(b.rule.n) && b.rule.n > 0)) errors.push(`${w}: review 배지는 n(양의 정수)이 필요`);
  if (k === "chapter" && !chapters.includes(b.rule.id)) errors.push(`${w}: 챕터 "${b.rule.id}"가 없음`);
}
// 질문 꾸러미(lib/kit.ts): "AI에게 이렇게 물어보세요" 단락은 (물어볼 것, 왜) 두 칸 표여야 줄을 읽을 수 있다
let askSets = 0;
for (const c of chapters) {
  for (const id of read(`content/chapters/${c}/order.json`)) {
    const sec = read(`content/chapters/${c}/${id}.json`).sections.find((s) => s.title === "AI에게 이렇게 물어보세요");
    if (!sec) continue;
    askSets++;
    const rows = [...sec.body.matchAll(/<tr><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><\/tr>/g)];
    if (!rows.length) errors.push(`질문 꾸러미: 레슨 ${id}의 질문 표에서 줄을 읽지 못함`);
    // 머리줄(th)을 뺀 줄 수와 읽은 줄 수가 같아야 한다(일부 줄만 읽히는 실수를 막는다)
    const trs = sec.body.split("<tr>").length - 1 - (sec.body.includes("<th>") ? 1 : 0);
    if (rows.length !== trs) errors.push(`질문 꾸러미: 레슨 ${id}의 표는 ${trs}줄인데 ${rows.length}줄만 읽음`);
    if (rows.some((r) => !r[1].replace(/<[^>]+>/g, "").trim())) errors.push(`질문 꾸러미: 레슨 ${id}에 빈 질문이 있음`);
  }
}
if (!askSets) errors.push("질문 꾸러미: 질문 표가 있는 레슨이 하나도 없음");
const usedEvents = new Set(badges.filter((b) => b.rule?.kind === "event").map((b) => b.rule.id));
for (const e of events) if (!usedEvents.has(e)) errors.push(`사건 "${e}"를 쓰는 배지가 없음`);

if (errors.length) {
  console.error(`[게임 규칙 검사] 실패 ${errors.length}건\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`[게임 규칙 검사] 통과: 레벨 ${lv.levels.length}개, 배지 ${badges.length}개, 사건 ${events.length}개, 질문 꾸러미 ${askSets}묶음`);
