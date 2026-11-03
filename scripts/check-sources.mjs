// 출처 검사 (기획안 5장 검수 규칙 1, 결정된 범위: (a)안)
//  - 실패(빌드 멈춤): 출처 칸이 있는 콘텐츠(블록 설명 단락·AI 말 번역기·미션 해설·공통 규칙·흐름 출처)에
//    출처가 0개이거나, sources.json에 없는 출처 id를 쓰면 실패한다.
//  - 실패: sources.json 항목의 필드(title, url, kind, checkedAt, volatile)가 비었거나 형식이 틀리면 실패한다.
//  - 경고(빌드 계속): 출처 칸이 아예 없는 콘텐츠(맞혀보기 해설·한 줄 정리·유형 소개·조립도 이유·흐름 단계)는
//    개수만 알려준다. 아무 곳에서도 쓰지 않는 출처도 경고한다.
// 사용법: node scripts/check-sources.mjs [--verbose]   (--verbose: 경고 항목을 하나씩 출력)
import { readFileSync } from "node:fs";

const read = (rel) => JSON.parse(readFileSync(new URL(`../content/${rel}`, import.meta.url), "utf8"));
const verbose = process.argv.includes("--verbose");
const errors = [];
const warnings = [];
const used = new Set();

const sources = read("sources.json");
for (const [id, s] of Object.entries(sources)) {
  if (!s.title || typeof s.title !== "string") errors.push(`출처 ${id}: title 없음`);
  if (!/^https:\/\/\S+$/.test(s.url ?? "")) errors.push(`출처 ${id}: url이 https 주소가 아님`);
  if (!["primary", "secondary"].includes(s.kind)) errors.push(`출처 ${id}: kind는 primary 또는 secondary`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.checkedAt ?? "")) errors.push(`출처 ${id}: checkedAt은 YYYY-MM-DD`);
  if (typeof s.volatile !== "boolean") errors.push(`출처 ${id}: volatile은 true/false`);
}

function need(where, list) {
  if (!Array.isArray(list) || list.length === 0) {
    errors.push(`${where}: 출처가 없습니다`);
    return;
  }
  for (const id of list) {
    if (!sources[id]) errors.push(`${where}: sources.json에 없는 출처 id "${id}"`);
    used.add(id);
  }
}
const short = (html) => html.replace(/<[^>]+>/g, "").slice(0, 30);

for (const id of read("blocks/order.json")) {
  const b = read(`blocks/${id}.json`);
  b.sections.forEach((s, i) => need(`블록 ${id} 설명 ${i + 1} "${s.title}"`, s.sources));
  warnings.push(`블록 ${id} 맞혀보기 해설 "${short(b.hook.reveal)}…"`, `블록 ${id} 한 줄 정리 "${short(b.sum)}…"`);
}
for (const p of read("phrases.json")) need(`AI 말 번역기 "${p.say}"`, p.sources);
for (const id of read("types/order.json")) {
  const t = read(`types/${id}.json`);
  t.missions.forEach((m, i) => need(`유형 ${id} 미션 ${i + 1}`, m.sources));
  if ("flowSources" in t) need(`유형 ${id} 흐름 출처`, t.flowSources);
  warnings.push(`유형 ${id} 소개 "${short(t.intro)}…"`);
  for (const [k, v] of Object.entries(t.asm)) warnings.push(`유형 ${id} 조립도 ${k} "${short(v.reason)}…"`);
  t.flow.forEach((f, i) => warnings.push(`유형 ${id} 흐름 ${i + 1} "${short(f)}…"`));
}
read("rules.json").forEach((r, i) => need(`공통 규칙 ${i + 1}`, r.sources));

for (const id of Object.keys(sources)) if (!used.has(id)) warnings.push(`출처 ${id}: 어떤 콘텐츠에서도 쓰지 않음`);

console.log(`[경고] 출처 칸이 없는 콘텐츠 등 ${warnings.length}건 (빌드는 계속)${verbose ? "" : " — 목록은 --verbose"}`);
if (verbose) for (const w of warnings) console.log("  - " + w);
if (errors.length) {
  console.error(`[실패] 출처 검사 ${errors.length}건\n` + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log("[통과] 출처 검사: 출처 칸이 있는 콘텐츠 전부 출처 연결됨");
