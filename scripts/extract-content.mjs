// 1회용 이식 스크립트: 프로토타입 v4의 콘텐츠를 content/ 폴더 JSON으로 옮긴다.
// 문장은 그대로 복사하고, 출처 표기만 배열(sources: [...])로 통일한다.
// 다시 실행하면 content/를 원본 기준으로 덮어쓴다 (이식 이후 수정분도 사라지므로 주의).
import { mkdirSync, writeFileSync } from "node:fs";
import { readPrototype } from "./lib/prototype.mjs";

const p = readPrototype();
const out = (rel, obj) => {
  const url = new URL(`../content/${rel}`, import.meta.url);
  mkdirSync(new URL(".", url), { recursive: true });
  writeFileSync(url, JSON.stringify(obj, null, 2) + "\n");
};

// 출처: kind·checkedAt·volatile은 기획안 5장 필드. 값의 근거는 docs/content-port-report.md 참고.
const SECONDARY = new Set(["kismock"]); // 제목에 "(2차 자료)"로 표시된 출처
const VOLATILE = new Set(["sbkey", "sbpause", "tosskey", "upbit", "kakao", "insta", "ec2", "claude", "kismock"]);
const sources = {};
for (const [id, [title, url]] of Object.entries(p.SRC)) {
  sources[id] = {
    title,
    url,
    kind: SECONDARY.has(id) ? "secondary" : "primary",
    checkedAt: "2026-10-09",
    volatile: VOLATILE.has(id),
  };
}
out("sources.json", sources);

out("blocks/order.json", p.BORDER);
for (const id of p.BORDER) {
  const b = p.B[id];
  out(`blocks/${id}.json`, {
    id,
    name: b.name,
    word: b.word,
    hook: b.hook,
    sections: b.sec.map(([title, body, src]) => ({ title, body, sources: src })),
    lab: b.lab,
    sum: b.sum,
  });
}

const typeOrder = [];
for (const t of p.T) {
  typeOrder.push(t.id);
  const flowSources = p.flowSrc.find((f) => f.type === t.id)?.sources;
  out(`types/${t.id}.json`, {
    id: t.id,
    ico: t.ico,
    name: t.name,
    sub: t.sub,
    hook: t.hook,
    intro: t.intro,
    asm: Object.fromEntries(Object.entries(t.asm).map(([k, [level, reason]]) => [k, { level, reason }])),
    flow: t.flow,
    ...(flowSources ? { flowSources } : {}),
    missions: t.ms.map(({ s, ...m }) => ({ ...m, sources: [s] })),
  });
}
out("types/order.json", typeOrder);

out(
  "phrases.json",
  p.PH.map(({ b, s, danger, ...rest }) => ({ block: b, ...rest, sources: [s], ...(danger ? { danger: true } : {}) })),
);
out("rules.json", p.rules);
console.log("이식 완료: sources", Object.keys(sources).length, "blocks", p.BORDER.length, "types", p.T.length, "phrases", p.PH.length, "rules", p.rules.length);
