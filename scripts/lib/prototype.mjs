// 프로토타입 v4 HTML에서 콘텐츠 상수(SRC, B, BORDER, PH, T)와 공통 규칙을 그대로 읽어오는 도구.
// 사람이 옮겨 적지 않고 원본 코드를 실행해서 읽기 때문에, 옮기는 과정에서 글자가 바뀔 수 없다.
import { readFileSync } from "node:fs";
import vm from "node:vm";

export const PROTOTYPE_PATH = new URL("../../prototype/code-block-classroom-prototype-v4.html", import.meta.url);

export function readPrototype() {
  const html = readFileSync(PROTOTYPE_PATH, "utf8");
  const start = html.indexOf("const SRC={");
  const end = html.indexOf("/* ============ 상태 ============ */");
  if (start < 0 || end < 0) throw new Error("프로토타입에서 콘텐츠 구간을 찾지 못했습니다");
  const code = html.slice(start, end) + "\n;({SRC,B,BORDER,PH,T})";
  const data = vm.runInNewContext(code, {});

  // 공통 규칙 3개: rules() 안의 <li>…<br>${srcs([...])}</li>
  const rulesFn = html.slice(html.indexOf("function rules(){"), html.indexOf("render();\n</script>"));
  const rules = [...rulesFn.matchAll(/<li>([\s\S]*?)<br>\$\{srcs\(\[([^\]]*)\]\)\}<\/li>/g)].map((m) => ({
    html: m[1],
    sources: m[2].split(",").map((s) => s.trim().replace(/^"|"$/g, "")),
  }));
  if (rules.length !== 3) throw new Error(`공통 규칙이 3개가 아닙니다: ${rules.length}`);

  // 유형 화면에서 bot에만 붙는 흐름 출처: ${t.id==="bot"?srcs(["kis"]):""}
  const flowSrc = [...html.matchAll(/t\.id==="(\w+)"\?srcs\(\[([^\]]*)\]\)/g)].map((m) => ({
    type: m[1],
    sources: m[2].split(",").map((s) => s.trim().replace(/^"|"$/g, "")),
  }));

  return { ...JSON.parse(JSON.stringify(data)), rules, flowSrc, html };
}
