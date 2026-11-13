// 레슨 다시 쓰기 도우미 (M4, CLAUDE.md 규칙 10·12). 화면에는 영향 없음. 빌드 검사에 들어가지 않는다.
// 사용법 (저장소 루트에서):
//   node scripts/lesson-tools.mjs verify  <챕터> <id...>   main과 비교: 근거 인용이 사라지거나 새로 생겼는지, 부품·순서·본문이 그대로인지
//   node scripts/lesson-tools.mjs comma   <챕터> <id...>   화면 글(제목·보기·표 칸 포함)에서 연결어미 뒤 쉼표 찾기
//   node scripts/lesson-tools.mjs extract <챕터> <출력폴더> <id...>   화면 글만 뽑아 <id>.txt로 저장(im-not-ai 입력용)
//   node scripts/lesson-tools.mjs packet  <챕터> <출력파일> <id...>   검토 자료(기본 화면 글, 바뀐 단락 전·후, 근거 인용과 원문 주소)
// <챕터>: ai-work 또는 ops. 작업 폴더의 파일 = 새 버전, BASE = 옛 버전(기본 origin/main, BASE 환경 변수로 바꿀 수 있다).
// 그래서 verify·packet은 고친 브랜치를 체크아웃한 상태에서 돌린다.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const [cmd, ch, ...rest] = process.argv.slice(2);
const BASE = process.env.BASE || "origin/main";
const rel = (id) => `content/chapters/${ch}/${id}.json`;
const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};
const cur = (id) => {
  try {
    return JSON.parse(readFileSync(rel(id), "utf8"));
  } catch {
    return fail(`레슨 파일을 읽지 못함: ${rel(id)} (챕터 이름과 레슨 id를 확인하세요)`);
  }
};
const old = (id) => {
  try {
    return JSON.parse(execSync(`git show ${BASE}:${rel(id)}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    return fail(`${BASE}에 ${rel(id)}가 없음 (새 레슨이면 verify·packet은 쓸 수 없다)`);
  }
};
const quotes = (l) => new Set(l.sections.flatMap((s) => (s.evidence || []).map((e) => e.source + "|" + e.quote)).concat((l.hook.evidence || []).map((e) => e.source + "|" + e.quote)));

// 규칙집 C-11: -고/-며/-지만/-면서/-아서·어서/-자/-는데 + 줄어든 꼴(잠가서·해서·져서 = 한글+서)
const COMMA = /((?:고|며|지만|면서|아서|어서|자|는데)|[가-힣]서)(<\/[a-z]+>)?\s*,/g;
const strip = (h) => h.replace(/<\/(td|th)>/g, " ; ").replace(/<\/tr>/g, " / ").replace(/<\/p>/g, " ").replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
const fields = (l) => [
  ["이름", l.name],
  ["낱말", l.word],
  ["질문", l.hook.q],
  ...l.hook.opts.map((o, i) => [`보기${i + 1}`, o]),
  ["해설", l.hook.reveal],
  ...l.sections.flatMap((s) => [
    [`${s.deep ? "[깊이]" : "[기본]"} 제목`, s.title],
    [`${s.deep ? "[깊이]" : "[기본]"} ${s.title}`, s.body],
  ]),
  ["한 줄 정리", l.sum],
];

if (cmd === "verify") {
  for (const id of rest) {
    const o = old(id), n = cur(id);
    console.log(`== ${id}`);
    for (const k of ["q", "reveal", "a"]) if (JSON.stringify(o.hook[k]) !== JSON.stringify(n.hook[k])) console.log(`  맞혀보기 바뀜: ${k}`);
    if (JSON.stringify(o.hook.opts) !== JSON.stringify(n.hook.opts)) console.log("  보기 바뀜");
    if (o.sum !== n.sum) console.log("  한 줄 정리 바뀜");
    const oq = quotes(o), nq = quotes(n), ob = new Set(o.sections.map((s) => s.body));
    for (const s of n.sections) {
      const fresh = (s.evidence || []).filter((e) => !oq.has(e.source + "|" + e.quote)).length;
      const known = o.sections.some((x) => x.title === s.title);
      console.log(`  ${s.deep ? "[깊이]" : "[기본]"} ${s.title} — 본문 ${ob.has(s.body) ? "그대로" : "바뀜"}${known ? "" : " (새 제목)"}${s.widget ? " 부품:" + s.widget : ""}${fresh ? ` 새 인용 ${fresh}개!` : ""}`);
    }
    for (const q of oq) if (!nq.has(q)) console.log(`  사라진 인용: ${q.slice(0, 70)}`);
    const ow = o.sections.map((s) => s.widget).filter(Boolean), nw = n.sections.map((s) => s.widget).filter(Boolean);
    if (JSON.stringify(ow) !== JSON.stringify(nw)) console.log(`  부품 바뀜: ${ow} → ${nw}`);
    const fd = n.sections.findIndex((s) => s.deep);
    if (fd >= 0 && n.sections.slice(fd).some((s) => !s.deep)) console.log("  순서 문제: 깊이 단락 뒤에 기본 단락이 있음(단락 번호는 JSON 순서대로 붙는다)");
  }
} else if (cmd === "comma") {
  let n = 0;
  for (const id of rest) {
    for (const [where, html] of fields(cur(id))) {
      for (const m of html.matchAll(COMMA)) {
        // 문맥은 실제로 찾은 위치(m.index) 앞뒤에서 잘라 보여 준다
        const ctx = strip(html.slice(Math.max(0, m.index - 80), m.index)) + " ▶" + strip(m[0]) + "◀ " + strip(html.slice(m.index + m[0].length, m.index + m[0].length + 60));
        console.log(`${++n}. ${id} | ${where} | ${ctx.slice(-110)}`);
      }
    }
  }
  console.log(`연결어미 쉼표 ${n}개`);
} else if (cmd === "extract") {
  const [out, ...ids] = rest;
  mkdirSync(out, { recursive: true });
  for (const id of ids) {
    const l = cur(id);
    const core = [l.hook.q, l.hook.reveal, ...l.sections.filter((s) => !s.deep).flatMap((s) => [s.title, s.body]), l.sum];
    const deep = l.sections.filter((s) => s.deep).flatMap((s) => [s.title, s.body]);
    writeFileSync(`${out}/${id}.txt`, [...core, ...deep].map(strip).join("\n\n"), "utf8");
  }
  console.log(`${ids.length}개 저장: ${out}`);
} else if (cmd === "packet") {
  const [out, ...ids] = rest;
  const sources = JSON.parse(readFileSync("content/sources.json", "utf8"));
  let md = `# 검토 자료: ${ids.join(", ")}\n\n`;
  for (const id of ids) {
    const o = old(id), n = cur(id);
    md += `## 레슨 ${id} "${n.name}"\n\n### 기본 화면에 보이는 것 (순서대로)\n- 질문: ${strip(n.hook.q)}\n- 해설: ${strip(n.hook.reveal)}\n`;
    if (o.hook.reveal !== n.hook.reveal) md += `  - (고치기 전 해설: ${strip(o.hook.reveal)})\n`;
    for (const s of n.sections.filter((s) => !s.deep)) md += `- 단락 "${s.title}": ${strip(s.body)}\n`;
    md += `- 한 줄 정리: ${strip(n.sum)}\n`;
    if (o.sum !== n.sum) md += `  - (고치기 전 한 줄 정리: ${strip(o.sum)})\n`;
    md += `- 더 깊이 보기 제목: ${n.sections.filter((s) => s.deep).map((s) => `"${s.title}"`).join(", ")}\n\n`;
    const ob = new Set(o.sections.map((s) => s.body));
    for (const s of n.sections) {
      if (ob.has(s.body)) continue;
      const before = o.sections.find((x) => x.title === s.title) || o.sections.find((x) => x.body.replace(COMMA, "$1$2") === s.body);
      md += `### 바뀐 단락: "${s.title}" ${s.deep ? "(더 깊이 보기)" : "(기본 화면)"}\n- 고치기 전${before ? ` ("${before.title}")` : ""}: ${before ? strip(before.body) : "(같은 제목 없음, 원래 단락에서 옮김)"}\n- 고친 뒤: ${strip(s.body)}\n`;
      if (s.evidence?.length) {
        md += "- 근거 인용:\n";
        for (const e of s.evidence) md += `  - [${e.source}] ${sources[e.source]?.url} — "${e.quote}"\n`;
      } else md += `- 출처: ${s.noSource}\n`;
      md += "\n";
    }
  }
  writeFileSync(out, md, "utf8");
  console.log(`저장: ${out} (${md.length}자)`);
} else {
  console.log("사용법은 파일 맨 위 주석을 보세요.");
  process.exit(1);
}
