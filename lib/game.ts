// 게임 판정 (기획서 v2 M1): 경험치·레벨·배지·학습 지도 칸 상태·"다음에 할 것".
// 규칙 숫자와 문구는 content/game/*.json에 두고, 여기서는 지금 기록으로 계산만 한다.
import badgeList from "@/content/game/badges.json";
import levelData from "@/content/game/levels.json";
import { BLOCKS, BORDER, CHAPTERS, TYPES } from "./content";
import type { GameRec, View, ViewState } from "./store";

type Answers = Record<string, [number, number]>;
type Rec = { answers: Answers; done: Record<string, number>; seen: Record<string, number>; cseen: Record<string, number>; game: GameRec };
export type Badge = { id: string; ico: string; name: string; how: string; rule: { kind: string; id?: string } };
export const BADGES = badgeList as Badge[];
export const LEVELS = levelData.levels;

export function xpOf(answers: Answers) {
  return Object.values(answers).reduce((n, a) => n + (a[1] === 1 ? levelData.xp.correct : levelData.xp.tried), 0);
}
// 지금 레벨(1부터)과 다음 레벨까지 남은 경험치
export function levelOf(xp: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].min) i++;
  const next = LEVELS[i + 1];
  return { n: i + 1, ...LEVELS[i], next: next ? next.min : null, toNext: next ? next.min - xp : 0 };
}

export function hasBadge(b: Badge, r: Rec): boolean {
  const k = b.rule.kind;
  if (k === "blocks") return BORDER.every((id) => r.seen[id]);
  if (k === "mission") return Object.entries(r.answers).some(([key, a]) => key.startsWith("mission:") && a[1] === 1);
  if (k === "types") return TYPES.every((t) => r.done[t.id]);
  if (k === "words") return BORDER.every((id) => r.game.words[id]) && CHAPTERS[0].lessons.every((l) => r.game.words[l.id]);
  if (k === "chapter") return !!CHAPTERS.find((c) => c.id === b.rule.id)?.lessons.every((l) => r.cseen[l.id]);
  if (k === "event") return !!r.game.ev[b.rule.id as string];
  return false; // "soon": 아직 열리지 않은 배지
}

// 칸 상태: 0 안 감, 1 답함(봤음), 2 첫 답에 맞힘(별)
export type Cell = { name: string; state: 0 | 1 | 2; to: [View, Partial<ViewState>] };
export type Region = { id: string; name: string; sub: string; cells: Cell[]; to: [View, Partial<ViewState>] };
const star = (a: [number, number] | undefined, opened: boolean): 0 | 1 | 2 => (a?.[1] === 1 ? 2 : a || opened ? 1 : 0);

export function regionsOf(r: Rec): Region[] {
  const missionStar = (tid: string, n: number) => Array.from({ length: n }, (_, i) => r.answers[`mission:${tid}:${i}`]).every((a) => a?.[1] === 1);
  return [
    {
      id: "blocks", name: "블록 마을", sub: "블록 9개", to: ["lesson", { bi: 0 }],
      cells: BORDER.map((id, bi) => ({ name: BLOCKS[id].name, state: star(r.answers[`block:${id}`], !!r.seen[id]), to: ["lesson", { bi }] })),
    },
    {
      id: "types", name: "조립 공방", sub: "만들고 싶은 것 7가지", to: ["pick", {}],
      cells: TYPES.map((t) => ({ name: t.name, state: r.done[t.id] ? (missionStar(t.id, t.missions.length) ? 2 : 1) : 0, to: ["type", { tid: t.id, tab: 0, mi: 0 }] })),
    },
    ...CHAPTERS.map((c, ch) => ({
      id: c.id, name: ch === 0 ? "AI 대화 광장" : "운영 요새", sub: c.name, to: ["chapter", { ch, ci: 0 }] as [View, Partial<ViewState>],
      cells: [
        ...c.lessons.map((l, ci) => ({ name: l.name, state: star(r.answers[`chapter:${l.id}`], !!r.cseen[l.id]), to: ["chapter", { ch, ci }] as [View, Partial<ViewState>] })),
        // 기획서 4-1: AI 대화 광장에는 AI 말 번역기(사전)도 한 칸. 묶음을 다 열어 보면 별(배지 "번역가"와 같은 기준)
        ...(ch === 0 ? [{ name: "AI 말 번역기", state: wordsState(r), to: ["words", { filter: "all" }] as [View, Partial<ViewState>] }] : []),
      ],
    })),
  ];
}
function wordsState(r: Rec): 0 | 1 | 2 {
  const groups = [...BORDER, ...CHAPTERS[0].lessons.map((l) => l.id)];
  const n = groups.filter((g) => r.game.words[g]).length;
  return n === groups.length ? 2 : n > 0 ? 1 : 0;
}
// 추천 순서(블록 → 유형 → 챕터)에서 아직 안 간 첫 칸
export function nextStep(regions: Region[]) {
  for (const g of regions) {
    const c = g.cells.find((x) => x.state === 0);
    if (c) return { region: g.name, cell: c };
  }
  return null;
}
