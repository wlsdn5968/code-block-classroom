// 출처 검사 (기획안 5장 검수 규칙 1, 결정된 범위: (a)안)
//  - 실패(빌드 멈춤): 출처 칸이 있는 콘텐츠(블록 설명 단락·AI 말 번역기·미션 해설·공통 규칙·흐름 출처)에
//    출처가 0개이거나, sources.json에 없는 출처 id를 쓰면 실패한다.
//  - 실패: sources.json 항목의 필드(title, url, kind, checkedAt, volatile)가 비었거나 형식이 틀리면 실패한다.
//  - 실패: volatile 출처의 checkedAt이 90일을 넘으면 실패한다 (분기 1회 재확인).
//  - 경고(빌드 계속): noSource("설명"/"비유")로 표시한 항목, 출처 칸이 아예 없는 콘텐츠(맞혀보기 해설·한 줄 정리·유형 소개·조립도 이유·흐름 단계)는
//    개수만 알려준다. 아무 곳에서도 쓰지 않는 출처도 경고한다.
// 사용법: node scripts/check-sources.mjs [--verbose]   (--verbose: 경고 항목을 하나씩 출력)
import { existsSync, readFileSync } from "node:fs";

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
  else {
    const d = new Date(s.checkedAt + "T00:00:00Z");
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s.checkedAt) errors.push(`출처 ${id}: checkedAt "${s.checkedAt}"은 실제 날짜가 아님`);
    else if (d.getTime() > Date.now()) errors.push(`출처 ${id}: checkedAt "${s.checkedAt}"이 미래 날짜`);
  }
  // 2차 자료는 제목에도 "(2차 자료)"로 표시되어야 화면에서 구분된다 (기획안 5장 규칙 2)
  const titledSecondary = /2차 자료/.test(s.title ?? "");
  if (s.kind === "secondary" && !titledSecondary) errors.push(`출처 ${id}: kind가 secondary인데 제목에 "(2차 자료)" 표시가 없음`);
  if (s.kind === "primary" && titledSecondary) errors.push(`출처 ${id}: 제목에 "2차 자료"가 있는데 kind가 primary`);
  if (typeof s.volatile !== "boolean") errors.push(`출처 ${id}: volatile은 true/false`);
}

// noSource: 출처가 없어도 되는 항목의 사유. "설명"(출처가 필요 없는 일반 설명) 또는 "비유"(비유 표).
// 결정 2(2026-11-03): 출처가 내용을 다루지 않는 줄 중 사실 문장은 출처 교체, 설명·비유 문장은 이 표시를 붙인다.
// 2026-11-09: "운영 기록" — 공개 출처가 없는 직접 운영 기록(사용자 승인, 프로젝트 이름은 빼고 표시).
const NO_SOURCE_KINDS = ["설명", "비유", "운영 기록"];
function need(where, list, noSource) {
  if (noSource !== undefined) {
    if (!NO_SOURCE_KINDS.includes(noSource)) errors.push(`${where}: noSource는 ${NO_SOURCE_KINDS.join("/")} 중 하나`);
    if (Array.isArray(list) && list.length) errors.push(`${where}: noSource와 sources를 같이 쓸 수 없음`);
    warnings.push(`${where}: 출처 없음(${noSource})`);
    return;
  }
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

function ordered(dir) {
  const ids = read(`${dir}/order.json`);
  if (new Set(ids).size !== ids.length) errors.push(`${dir}/order.json에 같은 id가 두 번 있음`);
  return ids.filter((id) => {
    if (!existsSync(new URL(`../content/${dir}/${id}.json`, import.meta.url))) {
      errors.push(`${dir}/order.json의 "${id}": 파일 ${dir}/${id}.json이 없음`);
      return false;
    }
    if (read(`${dir}/${id}.json`).id !== id) errors.push(`${dir}/${id}.json: 안의 id가 파일 이름과 다름`);
    return true;
  });
}

for (const id of ordered("blocks")) {
  const b = read(`blocks/${id}.json`);
  b.sections.forEach((s, i) => need(`블록 ${id} 설명 ${i + 1} "${s.title}"`, s.sources, s.noSource));
  warnings.push(`블록 ${id} 맞혀보기 해설 "${short(b.hook.reveal)}…"`, `블록 ${id} 한 줄 정리 "${short(b.sum)}…"`);
}
const says = new Set();
for (const p of read("phrases.json")) {
  need(`AI 말 번역기 "${p.say}"`, p.sources);
  if (says.has(p.say)) errors.push(`AI 말 번역기 "${p.say}": 같은 말이 두 번 있음 (화면 key로 쓰이므로 유일해야 함)`);
  says.add(p.say);
}
for (const id of ordered("types")) {
  const t = read(`types/${id}.json`);
  t.missions.forEach((m, i) => need(`유형 ${id} 미션 ${i + 1}`, m.sources, m.noSource));
  if ("flowSources" in t) need(`유형 ${id} 흐름 출처`, t.flowSources);
  warnings.push(`유형 ${id} 소개 "${short(t.intro)}…"`);
  for (const [k, v] of Object.entries(t.asm)) warnings.push(`유형 ${id} 조립도 ${k} "${short(v.reason)}…"`);
  t.flow.forEach((f, i) => warnings.push(`유형 ${id} 흐름 ${i + 1} "${short(f)}…"`));
}
read("rules.json").forEach((r, i) => need(`공통 규칙 ${i + 1}`, r.sources));

// 신규 챕터 (2026-11-03): 레슨 설명 단락과 번역기는 블록과 같은 규칙으로 검사한다.
const WIDGET_IDS = ["memory-sim", "nplus1-sim", "disk-fill"]; // components/widgets/index.ts와 맞춘다
for (const ch of ["ai-work", "ops"]) {
  for (const id of ordered(`chapters/${ch}`)) {
    const l = read(`chapters/${ch}/${id}.json`);
    l.sections.forEach((s, i) => {
      need(`챕터 ${ch} ${id} 설명 ${i + 1} "${s.title}"`, s.sources, s.noSource);
      if (s.widget !== undefined && !WIDGET_IDS.includes(s.widget)) errors.push(`챕터 ${ch} ${id} 설명 ${i + 1}: 없는 화면 부품 "${s.widget}"`);
    });
    warnings.push(`챕터 ${ch} ${id} 맞혀보기 해설 "${short(l.hook.reveal)}…"`, `챕터 ${ch} ${id} 한 줄 정리 "${short(l.sum)}…"`);
  }
}
for (const p of read("chapters/ai-work/phrases.json")) {
  need(`AI 말 번역기(챕터) "${p.say}"`, p.sources);
  if (says.has(p.say)) errors.push(`AI 말 번역기 "${p.say}": 같은 말이 두 번 있음`);
  says.add(p.say);
}

// 화면에 박힌 확인일(바닥글·공통 규칙)은 sources.json의 가장 최근 checkedAt과 같아야 한다.
// checkedAt을 갱신하면 화면 문구도 같이 고쳐야 하고, 이 검사가 그걸 잊지 않게 한다.
const latest = Object.values(sources).map((s) => s.checkedAt).sort().at(-1);
for (const rel of ["../components/Classroom.tsx", "../components/views/Rules.tsx"]) {
  const code = readFileSync(new URL(rel, import.meta.url), "utf8");
  for (const m of code.matchAll(/(\d{4}-\d{2}-\d{2})에? ?확인/g)) {
    if (m[1] !== latest) errors.push(`${rel.replace("../", "")}: 화면의 확인일 ${m[1]}이 sources.json 최신 checkedAt ${latest}과 다름`);
  }
}

for (const id of Object.keys(sources)) if (!used.has(id)) warnings.push(`출처 ${id}: 어떤 콘텐츠에서도 쓰지 않음`);
// volatile 출처는 분기 1회(90일) 안에 다시 확인해야 한다 (기획안 5장 규칙 3, 결정 c: 2026-11-03).
// 90일이 지나면 빌드가 멈춘다: 원문을 다시 열어 확인하고 checkedAt을 갱신해야 한다 (화면 확인일도 함께).
const RECHECK_DAYS = 90;
for (const [id, s] of Object.entries(sources)) {
  if (!s.volatile) continue;
  const days = Math.floor((Date.now() - new Date(s.checkedAt + "T00:00:00Z").getTime()) / 86400000);
  if (days > RECHECK_DAYS) errors.push(`출처 ${id} (volatile): 마지막 확인 후 ${days}일 경과 — ${RECHECK_DAYS}일 안에 원문을 다시 확인하고 checkedAt을 갱신해야 함`);
  else warnings.push(`출처 ${id} (volatile): 마지막 확인 후 ${days}일 경과 (${RECHECK_DAYS}일 주기)`);
}

console.log(`[경고] 출처 칸이 없는 콘텐츠 등 ${warnings.length}건 (빌드는 계속)${verbose ? "" : " — 목록은 --verbose"}`);
if (verbose) for (const w of warnings) console.log("  - " + w);
if (errors.length) {
  console.error(`[실패] 출처 검사 ${errors.length}건\n` + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log("[통과] 출처 검사: 출처 칸이 있는 콘텐츠 전부 출처 연결됨");
