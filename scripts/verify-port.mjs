// 이식 검증: content/ JSON을 프로토타입 원래 모양으로 되돌린 뒤, 프로토타입 원본과 한 글자씩 비교한다.
// 하나라도 다르면 어디가 다른지 출력하고 실패한다.
// 이식 이후 문장을 의도적으로 고친 경우, 그 항목은 아래 INTENDED_CHANGES에 등록해야 통과한다.
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { readPrototype } from "./lib/prototype.mjs";

const read = (rel) => JSON.parse(readFileSync(new URL(`../content/${rel}`, import.meta.url), "utf8"));
const p = readPrototype();

// 의도적으로 고친 항목: { path: "B.ui.sec.3", reason: "..." } 형태. 현재 없음.
const INTENDED_CHANGES = [];

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
  PH: read("phrases.json").map(({ block, say, mean, chk, sources, danger }) => ({
    b: block, say, mean, chk, s: sources[0], ...(danger ? { danger: 1 } : {}),
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
        o.s = sources[0];
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

const errors = [];
function diff(a, b, path) {
  if (isDeepStrictEqual(a, b)) return;
  if (INTENDED_CHANGES.some((c) => path === c.path || path.startsWith(c.path + "."))) return;
  if (a && b && typeof a === "object" && typeof b === "object" && Array.isArray(a) === Array.isArray(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) diff(a[k], b[k], `${path}.${k}`);
    return;
  }
  errors.push(`${path}\n  원본: ${JSON.stringify(a)}\n  이식: ${JSON.stringify(b)}`);
}
for (const key of ["SRC", "BORDER", "B", "PH", "T", "rules", "flowSrc"]) diff(p[key], rebuilt[key], key);

// 출처를 배열로 바꾼 항목은 원본에서 출처가 정확히 1개였어야 한다 (배열 길이 1).
for (const ph of read("phrases.json")) if (ph.sources.length !== 1) errors.push(`번역기 "${ph.say}": 원본은 출처 1개인데 ${ph.sources.length}개`);
for (const id of typeOrder) for (const m of read(`types/${id}.json`).missions) if (m.sources.length !== 1) errors.push(`${id} 미션: 출처 1개가 아님`);

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
console.log("이식 검증 통과: 원본 프로토타입과 글자 단위로 같음", JSON.stringify(count));
