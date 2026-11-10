// 손에 남는 결과물의 재료 (기획서 v2 5장, M2): 안전 수칙 카드와 질문 꾸러미.
// 새 문장을 만들지 않는다. 이미 승인된 레슨의 한 줄 정리(sum)와 "AI에게 이렇게 물어보세요" 표를 그대로 쓴다.
import { BLOCKS, BORDER, CHAPTERS } from "./content";
import { CHAPTER_REGIONS } from "./game";

type Seen = Record<string, number>;
export type Rule = { id: string; name: string; html: string; got: boolean };
export type RuleGroup = { id: string; name: string; rules: Rule[] };

// 수칙 카드: 맞혀보기에 답한 레슨의 한 줄 정리가 지역별 카드에 한 줄씩 붙는다
export function ruleGroups(seen: Seen, cseen: Seen): RuleGroup[] {
  return [
    { id: "blocks", name: "블록 마을", rules: BORDER.map((id) => ({ id, name: BLOCKS[id].name, html: BLOCKS[id].sum, got: !!seen[id] })) },
    ...CHAPTERS.map((c, ch) => ({ id: c.id, name: CHAPTER_REGIONS[ch] ?? c.name, rules: c.lessons.map((l) => ({ id: l.id, name: l.name, html: l.sum, got: !!cseen[l.id] })) })),
  ];
}

const ENT: Record<string, string> = { "&lt;": "<", "&gt;": ">", "&amp;": "&", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };
// 태그를 벗기고 공백을 하나로 줄인다 (앞뒤 공백은 남긴다: 굵은 글씨와 이어 붙일 때 필요)
const detag = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&(lt|gt|amp|quot|#39|nbsp);/g, (m) => ENT[m]).replace(/\s+/g, " ");
export const plain = (html: string) => detag(html).trim();
// <b>…</b>만 굵게 치고 나머지 태그는 벗긴다 (그림으로 그릴 때 씀)
export type Run = { t: string; b: boolean };
export function runs(html: string): Run[] {
  return html
    .split(/(<b>[\s\S]*?<\/b>)/)
    .map((part) => ({ t: detag(part), b: part.startsWith("<b>") }))
    .filter((r) => r.t !== "");
}

// 질문 꾸러미: 레슨의 "AI에게 이렇게 물어보세요" 표에서 (물어볼 것, 왜) 줄을 읽는다
export const ASK_TITLE = "AI에게 이렇게 물어보세요";
export type AskSet = { id: string; name: string; items: { q: string; why: string }[] };
export const ASK_SETS: AskSet[] = CHAPTERS.flatMap((c) => c.lessons).flatMap((l) => {
  const sec = l.sections.find((s) => s.title === ASK_TITLE);
  if (!sec) return [];
  const items = [...sec.body.matchAll(/<tr><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><\/tr>/g)].map((m) => ({ q: plain(m[1]), why: plain(m[2]) }));
  return [{ id: l.id, name: l.name, items }];
});
// 복사·파일 저장용 글자. 맞혀보기에 답한 레슨의 질문만 담는다
export function askText(cseen: Seen) {
  const sets = ASK_SETS.filter((s) => cseen[s.id]);
  return ["AI에게 물어볼 질문 꾸러미 (코드 블록 교실)", "", ...sets.flatMap((s) => [`[${s.name}]`, ...s.items.map((i) => `- ${i.q}`), ""])].join("\n");
}
