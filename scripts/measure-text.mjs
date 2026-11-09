// 콘텐츠 분량과 문장 길이 실측(읽기 전용, 기획서 v2 2-3절의 수치). 사용법: node scripts/measure-text.mjs
// 센 것: 블록·챕터 레슨의 맞혀보기 질문·해설, 설명 단락 본문(표 글자 포함), 한 줄 정리. HTML 태그를 지우고 공백을 하나로 줄인 글자 수.
// 문장 나누기: "." "?" "!" 또는 "요"·"다" 뒤 공백에서 자른 단순 기준(표 칸은 문장으로 나뉘지 않아 한 덩어리로 셀 수 있음). 4자 이하 조각은 뺌.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const repo = fileURLToPath(new URL("..", import.meta.url));
const strip = (h) => h.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
const sentences = (t) => t.split(/(?<=[.?!요다])\s+/).map((s) => s.trim()).filter((s) => s.length > 3);
const rows = [];
const add = (kind, id, name, parts) => {
  const text = strip(parts.join(" "));
  const ss = sentences(text);
  const long = ss.filter((s) => s.length > 60).length;
  rows.push({ kind, id, name, chars: text.length, sentences: ss.length, avg: ss.length ? Math.round(text.length / ss.length) : 0, long });
};
const C = join(repo, "content");
for (const id of JSON.parse(readFileSync(join(C, "blocks/order.json"), "utf8"))) {
  const b = JSON.parse(readFileSync(join(C, `blocks/${id}.json`), "utf8"));
  add("블록", id, b.name, [b.hook.q, b.hook.reveal, ...b.sections.map((s) => s.body), b.sum]);
}
for (const ch of ["ai-work", "ops"]) {
  for (const id of JSON.parse(readFileSync(join(C, `chapters/${ch}/order.json`), "utf8"))) {
    const l = JSON.parse(readFileSync(join(C, `chapters/${ch}/${id}.json`), "utf8"));
    add(`챕터 ${ch}`, id, l.name, [l.hook.q, l.hook.reveal, ...l.sections.map((s) => s.body), l.sum]);
  }
}
for (const r of rows) console.log(`${r.kind}\t${r.name}\t글자 ${r.chars}\t문장 ${r.sentences}\t평균 ${r.avg}자\t60자 넘는 문장 ${r.long}`);
const by = (k) => rows.filter((r) => r.kind.startsWith(k));
for (const k of ["블록", "챕터 ai-work", "챕터 ops"]) {
  const g = by(k);
  console.log(`[${k}] 레슨 ${g.length}개, 레슨당 평균 ${Math.round(g.reduce((a, r) => a + r.chars, 0) / g.length)}자, 60자 넘는 문장 합계 ${g.reduce((a, r) => a + r.long, 0)} / ${g.reduce((a, r) => a + r.sentences, 0)}`);
}
