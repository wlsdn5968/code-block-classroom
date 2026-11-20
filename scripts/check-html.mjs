// 콘텐츠 HTML 검사 (보안): 화면은 content/의 문장을 HTML 그대로 그린다(components/Html.tsx).
// 그래서 허용한 태그·속성 밖의 것이 콘텐츠에 들어오면 빌드를 멈춘다.
//  - 실패: 문장 안의 "<"가 허용한 태그 모양이 아니면 실패한다(">" 없이 잘린 태그, 스크립트·그림 태그, on… 속성 포함).
//    짝이 안 맞는 태그(<b>만 있고 </b>가 없음)는 위험하지 않아 여기서 보지 않는다.
//  - 실패: "javascript:" 같은 위험한 주소 글자가 있으면 실패한다.
//  - evidence(출처 원문 인용)는 화면에 쓰지 않으므로 건너뛴다(lib/content.ts). 이 이름의 키를 화면에 그리게 되면 여기서도 빼야 한다.
//  - 출처 주소(sources.json의 url)의 따옴표·꺾쇠는 scripts/check-sources.mjs가 막는다(링크는 콘텐츠가 아니라 코드가 만든다).
// 사용: node scripts/check-html.mjs [검사할 폴더]   (폴더를 안 주면 content/)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.argv[2] ?? fileURLToPath(new URL("../content", import.meta.url));
// 지금 콘텐츠가 실제로 쓰는 것만 허용한다. 새 태그·속성이 필요하면 여기에 더하고 PR에서 이유를 적는다.
const TAGS = new Set(["b", "code", "br", "p", "div", "table", "tr", "th", "td"]);
const ATTRS = new Set(["class", "data-new"]);
// 태그 하나: <이름 속성="값" …> 또는 </이름>. 속성 값은 따옴표로 감싸야 하고 값 안에 꺾쇠가 없어야 한다
const TAG = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z][a-zA-Z0-9-]*=(?:"[^"<>]*"|'[^'<>]*'))*)\s*>/;
const ATTR = /([a-zA-Z][a-zA-Z0-9-]*)=/g;
const BAD_URL = /javascript:|vbscript:|data:text/i;

const errors = [];
const files = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));
const short = (s, i) => s.slice(i, i + 40).replace(/\s+/g, " ");

function checkText(text, where) {
  if (BAD_URL.test(text)) errors.push(`${where}: 위험한 주소 글자`);
  for (let i = text.indexOf("<"); i !== -1; i = text.indexOf("<", i + 1)) {
    const m = TAG.exec(text.slice(i));
    if (!m) {
      errors.push(`${where}: 허용한 태그 모양이 아님 → ${short(text, i)}`);
      continue;
    }
    const [, close, name, attrs] = m;
    if (!TAGS.has(name.toLowerCase())) errors.push(`${where}: 허용하지 않은 태그 <${name}>`);
    if (close && attrs.trim()) errors.push(`${where}: 닫는 태그에 속성이 있음 → ${short(text, i)}`);
    for (const a of attrs.matchAll(ATTR)) if (!ATTRS.has(a[1].toLowerCase())) errors.push(`${where}: 허용하지 않은 속성 ${a[1]} (<${name}>)`);
  }
}
function visit(value, file, path) {
  if (typeof value === "string") checkText(value, `${file} ${path}`);
  else if (Array.isArray(value)) value.forEach((v, i) => visit(v, file, `${path}[${i}]`));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k === "evidence") continue;
      visit(v, file, path ? `${path}.${k}` : k);
    }
  }
}

const list = files(root).filter((f) => f.endsWith(".json"));
// 폴더를 잘못 가리켜 아무것도 검사하지 않고 통과하는 일을 막는다
if (list.length === 0) {
  console.error(`[HTML 검사] 검사할 JSON 파일이 없음: ${root}`);
  process.exit(1);
}
for (const f of list) visit(JSON.parse(readFileSync(f, "utf8")), f.slice(root.length + 1).replaceAll("\\", "/"), "");
if (errors.length) {
  console.error(`[HTML 검사] 문제 ${errors.length}개`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`[HTML 검사] 파일 ${list.length}개, 허용 목록 밖 태그·속성 0개`);
