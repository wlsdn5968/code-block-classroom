// 이식 검증: content/ JSON을 프로토타입 원래 모양으로 되돌린 뒤, 프로토타입 원본과 한 글자씩 비교한다.
// 하나라도 다르면 어디가 다른지 출력하고 실패한다.
// 이식 이후 문장을 의도적으로 고친 경우, 그 항목은 아래 INTENDED_CHANGES에 등록해야 통과한다.
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { readPrototype } from "./lib/prototype.mjs";

const read = (rel) => JSON.parse(readFileSync(new URL(`../content/${rel}`, import.meta.url), "utf8"));
const p = readPrototype();

// 의도적으로 고친 항목. path 또는 그 하위 경로의 차이는 통과시킨다. 사유는 docs/content-port-report.md 8절.
const INTENDED_CHANGES = [
  // 결정 1 (2026-11-03): "없앨 예정" → "지원 중단(deprecate)할 예정 … 예전 키는 직접 끄기 전까지는 계속 동작"
  { path: "B.key.sec.1.1", reason: "Supabase 원문은 deprecating이며 기존 키는 끄기 전까지 유효" },
  // 결정 a: 대시보드 조립도 '로그인' 등급(상황 따라)은 두고 문장만 수정
  { path: "T.0.asm.auth.1", reason: "등급 1과 '꼭 필요해요' 문장의 충돌 해소" },
  // 결정 2: 출처가 내용을 다루지 않던 줄의 출처 교체(사실 문장) 또는 noSource 표시(설명·비유)
  { path: "B.ui.sec.1.2" }, { path: "B.ui.sec.3.2" }, { path: "B.server.sec.1.2" }, { path: "B.server.sec.2.2" },
  { path: "B.ext.sec.0.2" }, { path: "B.ext.sec.1.2" }, { path: "B.db.sec.0.2" }, { path: "B.db.sec.1.2" },
  { path: "B.host.sec.1.2" }, { path: "B.host.sec.3.2" }, { path: "B.always.sec.3.2" }, { path: "B.auth.sec.2.2" },
  { path: "B.repo.sec.0.2" }, { path: "B.repo.sec.1.2" },
  { path: "PH.1.s" }, { path: "PH.14.s" },
  { path: "T.0.ms.2.s" }, { path: "T.1.ms.0.s" }, { path: "T.1.ms.1.s" }, { path: "T.6.ms.0.s" }, { path: "T.6.ms.1.s" }, { path: "T.3.ms.0.s" },
  // 결정 3: KIS 모의투자 — 공식 GitHub 안내(kisgh)를 1차 출처로 추가, 2차 자료는 유지
  { path: "T.2.ms.2.s" }, { path: "rules.1.sources" }, { path: "rules.2.sources" },
  // 후속(2026-11-03): SNS 미션 2에 Meta 제한 문서 추가, db 설명 1 엑셀 비유는 Supabase 표 문서가 직접 뒷받침 → 출처로 전환
  { path: "T.5.ms.1.s" },
  // 과제 2 (2026-11-03, 승인): 비유 5곳에 '실제로는' 보충 문장 추가 (기획안 5장 규칙 4)
  { path: "B.ui.sec.0.1" }, { path: "B.ui.sec.0.2" }, { path: "B.db.sec.0.1" }, { path: "B.key.sec.2.1" }, { path: "B.always.sec.1.1" }, { path: "B.repo.hook.reveal" },
  // 미결 과제 1 (2026-11-04, 승인 b-1): B.key.sec.2.1 보충 문장을 중복 없는 ghignore 원문 범위 표현으로 교체 (경로는 위 과제 2 항목으로 이미 등록됨)
  // 새로 추가한 출처 24건 (원본 SRC에는 없음)
  ...["mdnfirst", "mdnapi", "mdnjson", "mdnsql", "mdnserver", "mdnsec", "nextdocs", "nextroute", "vgenurls", "ghgit", "ghvis", "gitwhat", "gitbranch", "gitremotes", "claudeintro", "kisgh", "instafb", "sbtables", "cchow", "ccmemory", "claudectx", "ccmcp", "ccskills", "ccperm"].map((id) => ({ path: `SRC.${id}` })),
];

const sources = read("sources.json");
const order = read("blocks/order.json");
const typeOrder = read("types/order.json");
const rebuilt = {
  SRC: Object.fromEntries(Object.entries(sources).map(([id, s]) => [id, [s.title, s.url]])),
  BORDER: order,
  B: Object.fromEntries(
    order.map((id) => {
      const b = read(`blocks/${id}.json`);
      return [id, { name: b.name, word: b.word, hook: b.hook, sec: b.sections.map((s) => [s.title, s.body, s.sources]), lab: b.lab, sum: b.sum }];
    }),
  ),
  // 출처는 배열 전체를 비교한다(첫 값만 비교하면 2번째 이후 출처 변경을 놓친다). 원본 쪽은 아래에서 [s]로 맞춘다.
  PH: read("phrases.json").map(({ block, say, mean, chk, sources, danger }) => ({
    b: block, say, mean, chk, s: sources, ...(danger ? { danger: 1 } : {}),
  })),
  T: typeOrder.map((id) => {
    const t = read(`types/${id}.json`);
    return {
      id: t.id, ico: t.ico, name: t.name, sub: t.sub, hook: t.hook, intro: t.intro,
      asm: Object.fromEntries(Object.entries(t.asm).map(([k, v]) => [k, [v.level, v.reason]])),
      flow: t.flow,
      ms: t.missions.map(({ sources, ...m }) => {
        // 원래 키 순서 복원: k, (say|q), (ok|opts,a), why, s
        const o = {};
        for (const key of ["k", "say", "q", "opts", "a", "ok", "why"]) if (key in m) o[key] = m[key];
        o.s = sources;
        return o;
      }),
    };
  }),
  rules: read("rules.json"),
  flowSrc: typeOrder.flatMap((id) => {
    const t = read(`types/${id}.json`);
    return t.flowSources ? [{ type: id, sources: t.flowSources }] : [];
  }),
};

// 원본의 출처 칸(문자열 s)을 배열로 맞춰 이식본과 같은 모양으로 비교한다
const original = {
  ...p,
  PH: p.PH.map((x) => ({ ...x, s: [x.s] })),
  T: p.T.map((t) => ({ ...t, ms: t.ms.map((m) => ({ ...m, s: [m.s] })) })),
};
const errors = [];
const intendedHits = new Set();
function diff(a, b, path) {
  if (isDeepStrictEqual(a, b)) return;
  if (INTENDED_CHANGES.some((c) => path === c.path || path.startsWith(c.path + "."))) {
    intendedHits.add(path);
    return;
  }
  if (a && b && typeof a === "object" && typeof b === "object" && Array.isArray(a) === Array.isArray(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) diff(a[k], b[k], `${path}.${k}`);
    return;
  }
  errors.push(`${path}\n  원본: ${JSON.stringify(a)}\n  이식: ${JSON.stringify(b)}`);
}
for (const key of ["SRC", "BORDER", "B", "PH", "T", "rules", "flowSrc"]) diff(original[key], rebuilt[key], key);

// 출처를 배열로 바꾼 항목은 원본에서 출처가 정확히 1개였어야 한다 (배열 길이 1). 이후 출처를 바꾼 항목은 INTENDED_CHANGES로 통과.
const intendedMission = new Set(INTENDED_CHANGES.map((c) => c.path));
for (const ph of read("phrases.json")) if (ph.sources.length !== 1 && !intendedMission.has(`PH.${read("phrases.json").indexOf(ph)}.s`)) errors.push(`번역기 "${ph.say}": 원본은 출처 1개인데 ${ph.sources.length}개`);
for (const [ti, id] of typeOrder.entries()) for (const [mi, m] of read(`types/${id}.json`).missions.entries()) if (m.sources.length !== 1 && !intendedMission.has(`T.${ti}.ms.${mi}.s`)) errors.push(`${id} 미션 ${mi + 1}: 출처 1개가 아님`);

// 키 순서는 비교에서 무시되므로, 개수로 한 번 더 확인
const count = {
  sources: Object.keys(sources).length, blocks: order.length,
  sections: order.reduce((n, id) => n + read(`blocks/${id}.json`).sections.length, 0),
  phrases: read("phrases.json").length, types: typeOrder.length,
  missions: typeOrder.reduce((n, id) => n + read(`types/${id}.json`).missions.length, 0),
  rules: read("rules.json").length,
};

if (errors.length) {
  console.error(`이식 검증 실패: ${errors.length}곳이 원본과 다릅니다\n` + errors.join("\n"));
  process.exit(1);
}
console.log(`이식 검증 통과: 원본 프로토타입과 글자 단위로 같음 (승인된 변경 ${intendedHits.size}곳 제외)`, JSON.stringify(count));
