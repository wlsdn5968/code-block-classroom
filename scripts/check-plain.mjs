// 쉬운 말 검사 (기획서 v2 6장, M4). 경고만 낸다(빌드는 계속). 레슨을 다 고친 뒤 실패로 바꿀 예정.
// 대상: 챕터 레슨에서 기본으로 보이는 부분(맞혀보기 질문·해설, deep이 아닌 단락, 한 줄 정리).
//  - 긴 문장: 표와 코드를 뺀 글에서 60자를 넘는 문장
//  - 분량: 기본 부분 글자 수 900자 초과
//  - 풀이 없는 영어: 기본 부분에 처음 나오는 영어 낱말(3글자 이상) 뒤에 괄호 풀이가 없고, 허용 목록에도 없는 것
// 사용법: node scripts/check-plain.mjs [--verbose]   (--verbose: 긴 문장과 영어 낱말을 하나씩 출력)
import { readFileSync } from "node:fs";

const read = (rel) => JSON.parse(readFileSync(new URL(`../content/${rel}`, import.meta.url), "utf8"));
const verbose = process.argv.includes("--verbose");
const MAX_SENTENCE = 60;
const MAX_CORE = 900;
// 풀이 없이 써도 되는 낱말: 이 사이트의 다른 레슨에서 이미 배웠거나 상표·서비스 이름인 것
const KNOWN = new Set(["AI", "API", "CPU", "RAM", "DB", "MB", "GB", "KB", "XP", "OK", "PR", "URL", "VM", "SNS", "MCP", "MDN", "SQL", "OOM", "Claude", "Code", "GitHub", "Git", "Google", "Cloud", "Supabase", "Vercel", "Stripe", "PostgreSQL", "SQLite", "Red", "Hat", "AWS", "Linux", "Notion", "CLAUDE", "SKILL", "AGENTS", "Actions", "Instagram", "ChatGPT", "Console"]);

const noTable = (h) => h.replace(/<div class="tbl">[\s\S]*?<\/div>/g, " ");
const noCode = (h) => h.replace(/<code>[\s\S]*?<\/code>/g, " ");
const strip = (h) => h.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();
// 문장 나누기: 마침표·물음표·느낌표 뒤 공백(괄호 안 출처 표기 "(… 문서)." 포함)
const sentences = (t) => t.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter((s) => s.length > 3);

let total = { lessons: 0, long: 0, over: 0, eng: 0 };
for (const ch of ["ai-work", "ops"]) {
  for (const id of read(`chapters/${ch}/order.json`)) {
    const l = read(`chapters/${ch}/${id}.json`);
    const coreHtml = [l.hook.q, l.hook.reveal, ...l.sections.filter((s) => !s.deep).map((s) => s.body), l.sum];
    const coreText = strip(coreHtml.join(" "));
    const prose = strip(noCode(noTable(coreHtml.join(" "))));
    const long = sentences(prose).filter((s) => s.length > MAX_SENTENCE);
    // 영어 낱말: 뒤에 "(" 풀이가 바로 오는 것은 통과. 괄호 안의 글(풀이·출처 표기 쪽)은 보지 않는다
    const eng = [];
    const seen = new Set();
    const outside = prose.replace(/\([^()]*\)/g, (p) => "(" + " ".repeat(p.length - 2) + ")");
    for (const m of outside.matchAll(/[A-Za-z][A-Za-z.]{2,}/g)) {
      const w = m[0].replace(/\.$/, "");
      if (seen.has(w) || KNOWN.has(w)) continue;
      seen.add(w);
      if (outside.slice(m.index + m[0].length, m.index + m[0].length + 2).trimStart().startsWith("(")) continue;
      eng.push(w);
    }
    const deepN = l.sections.filter((s) => s.deep).length;
    total.lessons++;
    total.long += long.length;
    total.over += coreText.length > MAX_CORE ? 1 : 0;
    total.eng += eng.length;
    console.log(`[쉬운 말] ${ch}/${id} "${l.name}": 기본 ${coreText.length}자${coreText.length > MAX_CORE ? "(900자 넘음)" : ""}, 긴 문장 ${long.length}개, 풀이 없는 영어 ${eng.length}개, 더 깊이 ${deepN}단락`);
    if (verbose) {
      for (const s of long) console.log(`   긴 문장(${s.length}자): ${s}`);
      if (eng.length) console.log(`   영어: ${eng.join(", ")}`);
    }
  }
}
console.log(`[쉬운 말] 합계: 레슨 ${total.lessons}개, 긴 문장 ${total.long}개, 900자 넘는 레슨 ${total.over}개, 풀이 없는 영어 ${total.eng}개 (경고만, 빌드는 계속)`);
