// 게임 규칙 검사 (기획서 v2 M1, 빌드 전 실행): content/game/*.json의 실수를 빌드에서 막는다.
//  - 레벨: 첫 기준값 0, 기준값이 커지는 순서, 이름·뜻이 비어 있지 않음, 경험치 값이 양의 정수
//  - 배지: id 중복 없음, 이름·설명·아이콘 있음, 판정 종류가 알려진 것, event는 lib/store.ts의 GAME_EVENTS에 있는 것, chapter는 있는 챕터
import { readFileSync, readdirSync } from "node:fs";

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
    // 줄(<tr …>)은 속성이 붙어 있어도 세고, 머리줄은 <th>가 든 줄 수만큼 뺀다(표가 2개여도 맞게)
    const allRows = sec.body.match(/<tr[\s>][\s\S]*?<\/tr>/g) ?? [];
    const trs = allRows.filter((r) => !r.includes("<th")).length;
    if (rows.length !== trs) errors.push(`질문 꾸러미: 레슨 ${id}의 표는 ${trs}줄인데 ${rows.length}줄만 읽음`);
    if (rows.some((r) => !r[1].replace(/<[^>]+>/g, "").trim())) errors.push(`질문 꾸러미: 레슨 ${id}에 빈 질문이 있음`);
  }
}
if (!askSets) errors.push("질문 꾸러미: 질문 표가 있는 레슨이 하나도 없음");
const usedEvents = new Set(badges.filter((b) => b.rule?.kind === "event").map((b) => b.rule.id));
for (const e of events) if (!usedEvents.has(e)) errors.push(`사건 "${e}"를 쓰는 배지가 없음`);

// 실험실 목표(M3): quests.json의 id와 lib/store.ts의 GAME_QUESTS가 똑같아야 하고, 그 목표를 쓰는 화면 부품이 있어야 한다
const questIds = [...(store.match(/GAME_QUESTS = \[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const quests = read("content/game/quests.json");
if (!questIds.length) errors.push("lib/store.ts에서 GAME_QUESTS를 찾지 못함");
for (const q of quests) {
  if (!q.id || !q.goal) errors.push(`목표 ${q.id ?? "(id 없음)"}: id·goal 필요`);
  if (!questIds.includes(q.id)) errors.push(`목표 "${q.id}"가 GAME_QUESTS에 없음`);
}
const widgetCode = readdirSync(new URL("../components/widgets/", import.meta.url)).map((f) => readFileSync(new URL(`../components/widgets/${f}`, import.meta.url), "utf8")).join("\n");
for (const id of questIds) {
  if (quests.filter((q) => q.id === id).length !== 1) errors.push(`목표 "${id}"가 quests.json에 정확히 1개 있어야 함`);
  if (!widgetCode.includes(`<Quest id="${id}"`)) errors.push(`목표 "${id}"를 쓰는 화면 부품이 없음`);
}
for (const k of ["quest", "bossStar"]) if (!Number.isInteger(lv.xp?.[k]) || lv.xp[k] <= 0) errors.push(`levels.json xp.${k}는 양의 정수`);

// 챕터 보스(M3): 있는 챕터에만, 문제는 5개, 승인·확인이 섞여 있어야 한다(한쪽만 찍어도 다 맞지 않게). 출처는 check-sources가 본다
const boss = read("content/game/boss.json");
let bossN = 0;
for (const [ch, items] of Object.entries(boss)) {
  if (!chapters.includes(ch)) errors.push(`보스: 챕터 "${ch}"가 없음`);
  if (!Array.isArray(items) || items.length !== 5) errors.push(`보스 ${ch}: 문제는 5개여야 함`);
  else {
    items.forEach((m, i) => {
      if (!m.say || !m.why || typeof m.ok !== "boolean") errors.push(`보스 ${ch} ${i + 1}: say·why·ok(true/false) 필요`);
    });
    const oks = items.filter((m) => m.ok).length;
    if (oks === 0 || oks === items.length) errors.push(`보스 ${ch}: 승인과 확인이 섞여 있어야 함`);
    bossN += items.length;
  }
}

// 마지막 레벨은 실제로 닿을 수 있어야 한다: 복습을 뺀 최대 경험치(문제 × correct + 목표 × quest + 보스 별 3개씩 × bossStar) 이하
const keyAnswers = [...(readFileSync(new URL("../lib/keyLab.ts", import.meta.url), "utf8").match(/KEY_LAB_ANSWERS = \[([^\]]*)\]/)?.[1] ?? "").matchAll(/\d+/g)].length;
const missions = read("content/types/order.json").reduce((n, id) => n + read(`content/types/${id}.json`).missions.length, 0);
const lessons = chapters.reduce((n, c) => n + read(`content/chapters/${c}/order.json`).length, 0);
const questions = read("content/blocks/order.json").length + lessons + missions + keyAnswers;
const maxXp = questions * lv.xp.correct + quests.length * lv.xp.quest + Object.keys(boss).length * 3 * lv.xp.bossStar;
const top = lv.levels?.at(-1)?.min;
if (!(top <= maxXp)) errors.push(`레벨: 마지막 레벨 기준 ${top}이 얻을 수 있는 최대 경험치 ${maxXp}(문제 ${questions}개 기준)보다 큼`);

if (errors.length) {
  console.error(`[게임 규칙 검사] 실패 ${errors.length}건\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`[게임 규칙 검사] 통과: 레벨 ${lv.levels.length}개, 배지 ${badges.length}개, 사건 ${events.length}개, 질문 꾸러미 ${askSets}묶음, 목표 ${quests.length}개, 보스 문제 ${bossN}개, 최대 경험치 ${maxXp}(문제 ${questions}개)`);
