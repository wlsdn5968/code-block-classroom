// content/ 폴더의 JSON을 화면 코드에서 쓰기 좋은 모양으로 묶는다. 문장은 JSON 그대로 쓴다.
import sourcesJson from "@/content/sources.json";
import blockOrder from "@/content/blocks/order.json";
import typeOrder from "@/content/types/order.json";
import phrasesJson from "@/content/phrases.json";
import rulesJson from "@/content/rules.json";
import ui from "@/content/blocks/ui.json";
import server from "@/content/blocks/server.json";
import db from "@/content/blocks/db.json";
import auth from "@/content/blocks/auth.json";
import ext from "@/content/blocks/ext.json";
import key from "@/content/blocks/key.json";
import host from "@/content/blocks/host.json";
import always from "@/content/blocks/always.json";
import repo from "@/content/blocks/repo.json";
import dash from "@/content/types/dash.json";
import game from "@/content/types/game.json";
import bot from "@/content/types/bot.json";
import ai from "@/content/types/ai.json";
import pay from "@/content/types/pay.json";
import sns from "@/content/types/sns.json";
import design from "@/content/types/design.json";
import chapterOrder from "@/content/chapters/ai-work/order.json";
import chapterPhrases from "@/content/chapters/ai-work/phrases.json";
import chCtx from "@/content/chapters/ai-work/ctx.json";
import chMcp from "@/content/chapters/ai-work/mcp.json";
import chSkill from "@/content/chapters/ai-work/skill.json";
import chPerm from "@/content/chapters/ai-work/perm.json";
import opsOrder from "@/content/chapters/ops/order.json";
import opsMem from "@/content/chapters/ops/mem.json";
import opsDbslow from "@/content/chapters/ops/dbslow.json";
import opsPileup from "@/content/chapters/ops/pileup.json";
import opsNullzero from "@/content/chapters/ops/nullzero.json";
import opsLimits from "@/content/chapters/ops/limits.json";
import opsBill from "@/content/chapters/ops/bill.json";
import opsAidelete from "@/content/chapters/ops/aidelete.json";
import opsRetry from "@/content/chapters/ops/retry.json";

export type Source = { title: string; url: string; kind: "primary" | "secondary"; checkedAt: string; volatile: boolean };
export type Block = {
  id: string;
  name: string;
  word: string;
  hook: { q: string; opts: string[]; a: number; reveal: string };
  // noSource: 출처가 없어도 되는 항목의 사유("설명" | "비유"). 이때 sources는 빈 배열.
  sections: { title: string; body: string; sources: string[]; noSource?: string }[];
  lab: string;
  sum: string;
};
export type Mission =
  | { k: "ai"; say: string; ok: boolean; why: string; sources: string[]; noSource?: string }
  | { k: "mc"; q: string; opts: string[]; a: number; why: string; sources: string[]; noSource?: string };
export type ServiceType = {
  id: string;
  ico: string;
  name: string;
  sub: string;
  hook: string;
  intro: string;
  asm: Record<string, { level: number; reason: string }>;
  flow: string[];
  flowSources?: string[];
  missions: Mission[];
};
export type Phrase = { block: string; say: string; mean: string; chk: string; sources: string[]; danger?: boolean };
export type Rule = { html: string; sources: string[] };

export const SOURCES = sourcesJson as Record<string, Source>;
export const BORDER = blockOrder as string[];
const blockList = [ui, server, db, auth, ext, key, host, always, repo] as Block[];
export const BLOCKS: Record<string, Block> = Object.fromEntries(blockList.map((b) => [b.id, b]));
// order.json에 있는데 여기 등록되지 않은 블록·유형이 있으면 빌드가 멈춘다 (홈 화면이 빌드 때 이 파일을 읽는다)
for (const id of BORDER) if (!BLOCKS[id]) throw new Error(`content/blocks/order.json의 "${id}"가 lib/content.ts에 등록되지 않았습니다`);
const typeList = [dash, game, bot, ai, pay, sns, design] as ServiceType[];
const typeById = Object.fromEntries(typeList.map((t) => [t.id, t]));
export const TYPES: ServiceType[] = (typeOrder as string[]).map((id) => {
  if (!typeById[id]) throw new Error(`content/types/order.json의 "${id}"가 lib/content.ts에 등록되지 않았습니다`);
  return typeById[id];
});
// 신규 챕터 "AI와 일하는 법" (2026-11-03): 블록과 같은 모양의 레슨 4개, 실험실 없음.
// JSON의 evidence 필드는 출처 원문 인용(감사용)이며 화면에는 쓰지 않는다.
// 챕터 레슨의 설명 단락에는 숫자를 직접 움직여 보는 화면 부품(widget, components/widgets)을 붙일 수 있다.
export type Lesson = Omit<Block, "lab" | "sections"> & { lab?: string; sections: (Block["sections"][number] & { widget?: string })[] };
export type Chapter = { id: string; name: string; sub: string; lessons: Lesson[] };
const makeChapter = (id: string, name: string, sub: string, order: string[], list: Lesson[]): Chapter => {
  const byId = Object.fromEntries(list.map((l) => [l.id, l]));
  return {
    id,
    name,
    sub,
    lessons: order.map((lid) => {
      if (!byId[lid]) throw new Error(`content/chapters/${id}/order.json의 "${lid}"가 lib/content.ts에 등록되지 않았습니다`);
      return byId[lid];
    }),
  };
};
// 챕터 2 '만든 다음에 터지는 것들' (2026-11-09): 운영하면서 실제로 겪는 문제. 레슨 id는 챕터를 통틀어 겹치면 안 된다(진도·점수 키).
export const CHAPTERS: Chapter[] = [
  makeChapter("ai-work", "AI와 일하는 법", "컨텍스트 · MCP · 스킬 · 권한 승인", chapterOrder as string[], [chCtx, chMcp, chSkill, chPerm] as Lesson[]),
  makeChapter("ops", "만든 다음에 터지는 것들", "메모리 · DB · 기록 · 빈 값 · 한도 · 요금 · 삭제 · 재시도", opsOrder as string[], [opsMem, opsDbslow, opsPileup, opsNullzero, opsLimits, opsBill, opsAidelete, opsRetry] as Lesson[]),
];
export const CHAPTER = CHAPTERS[0];
export const LESSONS: Record<string, Lesson> = Object.fromEntries(CHAPTERS.flatMap((c) => c.lessons).map((l) => [l.id, l]));
if (Object.keys(LESSONS).length !== CHAPTERS.reduce((n, c) => n + c.lessons.length, 0)) throw new Error("챕터 레슨 id가 겹칩니다");
// 번역기: 기존 19개 + 챕터 5개. block 값이 블록 id면 블록 이름, 챕터 레슨 id면 레슨 이름으로 표시한다.
export const PHRASES = [...(phrasesJson as Phrase[]), ...(chapterPhrases as Phrase[])];
export const CHAPTER_PHRASE_COUNT = (chapterPhrases as Phrase[]).length;
export const phraseGroupName = (block: string) => BLOCKS[block]?.name ?? LESSONS[block]?.name ?? "";
export const RULES = rulesJson as Rule[];

// 프로토타입 src()/srcs()와 같은 HTML을 만든다.
export const srcLink = (k: string) => `<a href="${SOURCES[k].url}" target="_blank" rel="noopener">${SOURCES[k].title}</a>`;
export const srcLinks = (ids: string[]) => ids.map(srcLink).join(" · ");
