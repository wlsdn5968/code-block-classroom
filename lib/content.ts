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
export const PHRASES = phrasesJson as Phrase[];
export const RULES = rulesJson as Rule[];

// 프로토타입 src()/srcs()와 같은 HTML을 만든다.
export const srcLink = (k: string) => `<a href="${SOURCES[k].url}" target="_blank" rel="noopener">${SOURCES[k].title}</a>`;
export const srcLinks = (ids: string[]) => ids.map(srcLink).join(" · ");
