// 화면 상태 저장소. 프로토타입의 S(화면 상태)·L(실험실 상태)·done·seen과 같은 규칙으로 움직인다.
// React 밖의 작은 저장소로 두고 useSyncExternalStore로 화면을 다시 그린다.
import { BLOCKS, BORDER, CHAPTERS, TYPES } from "./content";
import { KEY_LAB_ANSWERS } from "./keyLab";

export type View = "home" | "lesson" | "pick" | "type" | "words" | "rules" | "chapter" | "me" | "review" | "card" | "ask" | "boss";
export type ViewState = {
  view: View;
  bi: number;
  guess: number | null;
  tid: string | null;
  tab: number;
  mi: number;
  ans: number | null;
  score: number;
  max: number;
  filter: string;
  // 챕터: 챕터 번호(ch), 레슨 번호(ci)와 맞혀보기 선택 (블록의 bi·guess와 같은 규칙)
  ch: number;
  ci: number;
  cguess: number | null;
};
// 실험실마다 쓰는 값이 달라서 느슨한 모양으로 둔다 (프로토타입의 L과 같음)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LabState = Record<string, any>;

const S: ViewState = { view: "home", bi: 0, guess: null, tid: null, tab: 0, mi: 0, ans: null, score: 0, max: 0, filter: "all", ch: 0, ci: 0, cguess: null };
let L: LabState = {};
let done: Record<string, number> = {};
let seen: Record<string, number> = {};
let cseen: Record<string, number> = {}; // 챕터 진도 (localStorage "cs-cseen")
// 문제마다 첫 답만 기록한다 (localStorage "cs-answers"): 문제 키 → [고른 답 번호, 맞으면 1]. 점수는 여기서 센다
let answers: Record<string, [number, number]> = {};
// 게임 기록 (localStorage "cs-game", 기획서 v2 M1): 게임 사건(배지 판정용)과 열어 본 번역기 묶음. 기존 기록 4개는 그대로 둔다
// review: 복습함에서 다시 맞힌 문제의 키 (기획서 v2 M2)
// quest: 달성한 실험실 목표, boss: 챕터 보스에서 받은 가장 높은 별 수 1~3 (기획서 v2 M3)
export type GameRec = { v: 1; ev: Record<string, 1>; words: Record<string, 1>; review: Record<string, 1>; quest: Record<string, 1>; boss: Record<string, number> };
export const GAME_QUESTS = ["memory", "nplus", "disk", "null", "rate", "loop", "delete", "retry"] as const;
export const GAME_EVENTS = ["words-danger", "memory-short", "null-all3", "rate-max", "delete-rollback", "retry-key"] as const;
let game: GameRec = { v: 1, ev: {}, words: {}, review: {}, quest: {}, boss: {} };
let version = 0;
// 프로토타입 render()처럼 화면 전체를 다시 그린 횟수. 바뀌면 .page 등장 애니메이션이 다시 재생된다.
let page = 0;
const listeners = new Set<() => void>();

function emit() {
  version++;
  listeners.forEach((l) => l());
}

// localStorage는 브라우저에서만 읽고 쓴다 (빌드 중에는 window가 없음)
function load(k: string, d: string) {
  try {
    return JSON.parse(localStorage.getItem(k) || d);
  } catch {
    return JSON.parse(d);
  }
}
function store(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}
// 뒤로가기로 돌아올 화면 (점수·답은 넣지 않는다)
const place = () => ({ view: S.view, bi: S.bi, tid: S.tid, tab: S.tab, mi: S.mi, filter: S.filter, ch: S.ch, ci: S.ci });
const placeKey = () => [S.view, S.bi, S.tid, S.tab, S.ch, S.ci].join("|");
const blockKey = () => `block:${BORDER[S.bi]}`;
const chapterKey = () => `chapter:${CHAPTERS[S.ch]?.lessons[S.ci]?.id}`;
// 이미 푼 블록·챕터 레슨은 고른 답을 되살려 설명을 열어 둔다 (복습)
const prior = (key: string) => answers[key]?.[0] ?? null;
// 지금 콘텐츠에 있는 문제의 키만 센다 (지운 문제의 옛 기록은 버린다)
const VALID_KEYS = new Set([
  ...BORDER.map((id) => `block:${id}`),
  ...CHAPTERS.flatMap((c) => c.lessons.map((l) => `chapter:${l.id}`)),
  ...TYPES.flatMap((t) => t.missions.map((_, mi) => `mission:${t.id}:${mi}`)),
  ...KEY_LAB_ANSWERS.map((_, i) => `key:${i}`),
]);
// 저장값이 망가져 있어도 화면이 멈추지 않게 올바른 기록만 남긴다
function readAnswers(): Record<string, [number, number]> {
  const saved = load("cs-answers", "{}");
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
  return Object.fromEntries(
    Object.entries(saved).filter(([k, v]) => VALID_KEYS.has(k) && Array.isArray(v) && v.length === 2 && Number.isInteger(v[0]) && (v[1] === 0 || v[1] === 1)),
  ) as Record<string, [number, number]>;
}
const WORD_GROUPS = new Set<string>([...BORDER, ...CHAPTERS[0].lessons.map((l) => l.id)]);
const onlyOnes = (o: unknown, ok: (k: string) => boolean) =>
  o && typeof o === "object" && !Array.isArray(o) ? (Object.fromEntries(Object.entries(o).filter(([k, v]) => ok(k) && v === 1)) as Record<string, 1>) : {};
const CHAPTER_IDS = new Set(CHAPTERS.map((c) => c.id));
// 두 기록을 합친다: 있는 기록은 지우지 않고, 보스 별은 더 높은 쪽을 남긴다
function mergeGame(a: GameRec, b: GameRec): GameRec {
  const boss = { ...a.boss };
  for (const [k, v] of Object.entries(b.boss)) boss[k] = Math.max(boss[k] ?? 0, v);
  return { v: 1, ev: { ...a.ev, ...b.ev }, words: { ...a.words, ...b.words }, review: { ...a.review, ...b.review }, quest: { ...a.quest, ...b.quest }, boss };
}
const gameSize = (g: GameRec) => Object.keys(g.ev).length + Object.keys(g.words).length + Object.keys(g.review).length + Object.keys(g.quest).length + Object.values(g.boss).reduce((n, v) => n + v, 0);
function cleanGame(g: unknown): GameRec {
  const o = (g && typeof g === "object" ? g : {}) as Record<string, unknown>;
  const boss = o.boss && typeof o.boss === "object" && !Array.isArray(o.boss) ? Object.fromEntries(Object.entries(o.boss).filter(([k, v]) => CHAPTER_IDS.has(k) && (v === 1 || v === 2 || v === 3))) : {};
  return {
    v: 1,
    ev: onlyOnes(o.ev, (k) => (GAME_EVENTS as readonly string[]).includes(k)),
    words: onlyOnes(o.words, (k) => WORD_GROUPS.has(k)),
    review: onlyOnes(o.review, (k) => VALID_KEYS.has(k)),
    quest: onlyOnes(o.quest, (k) => (GAME_QUESTS as readonly string[]).includes(k)),
    boss: boss as Record<string, number>,
  };
}
const readGame = () => cleanGame(load("cs-game", "{}"));
// 기록 3개(유형 완료, 블록·챕터 맞혀보기 답함)도 망가진 값·없는 id를 걸러 읽는다 (저장값이 null이어도 화면이 멈추지 않게)
const TYPE_IDS = new Set(TYPES.map((t) => t.id));
const BLOCK_IDS = new Set<string>(BORDER);
const LESSON_IDS = new Set(CHAPTERS.flatMap((c) => c.lessons.map((l) => l.id)));
const readDone = () => onlyOnes(load("cs-done", "{}"), (k) => TYPE_IDS.has(k));
const readSeen = () => onlyOnes(load("cs-seen", "{}"), (k) => BLOCK_IDS.has(k));
const readCseen = () => onlyOnes(load("cs-cseen", "{}"), (k) => LESSON_IDS.has(k));
// 같은 사건은 한 번만 남긴다. 다른 탭의 기록을 지우지 않게 저장 직전에 다시 읽어 합친다
export function gameEvent(id: (typeof GAME_EVENTS)[number]) {
  if (typeof window === "undefined" || game.ev[id]) return;
  game = readGame();
  game.ev[id] = 1;
  store("cs-game", game);
  emit();
}
export function wordsSeen(filter: string) {
  if (typeof window === "undefined") return;
  if (filter === "danger") gameEvent("words-danger");
  if (!WORD_GROUPS.has(filter) || game.words[filter]) return;
  game = readGame();
  game.words[filter] = 1;
  store("cs-game", game);
  emit();
}
// 실험실 목표를 달성하면 한 번만 기록한다
export function questDone(id: (typeof GAME_QUESTS)[number]) {
  if (typeof window === "undefined" || game.quest[id]) return;
  game = readGame();
  game.quest[id] = 1;
  store("cs-game", game);
  emit();
}
// 챕터 보스: 가장 높은 별 수만 남긴다(다시 도전해서 낮게 받아도 줄지 않는다)
export function bossDone(chapterId: string, stars: number) {
  if (typeof window === "undefined" || !CHAPTER_IDS.has(chapterId) || ![1, 2, 3].includes(stars)) return;
  game = readGame();
  if ((game.boss[chapterId] ?? 0) >= stars) return;
  game.boss[chapterId] = stars;
  store("cs-game", game);
  emit();
}
// 복습함: 첫 답이 틀렸던 문제를 다시 맞히면 한 번만 기록한다. 점수판(첫 답)은 바뀌지 않는다
export function reviewDone(key: string) {
  if (typeof window === "undefined" || answers[key]?.[1] !== 0 || game.review[key]) return;
  game = readGame();
  game.review[key] = 1;
  store("cs-game", game);
  emit();
}
function syncScore() {
  const all = Object.values(answers);
  S.max = all.length;
  S.score = all.filter((a) => a[1] === 1).length;
}
function onPopState(e: PopStateEvent) {
  if (!e.state?.view) return;
  const { view, bi, tid, tab, mi, filter, ch = 0, ci } = e.state;
  Object.assign(S, { view, bi, tid, tab, mi, filter, ch, ci, ans: null });
  S.guess = prior(blockKey());
  S.cguess = prior(chapterKey());
  L = {};
  render();
  window.scrollTo({ top: 0 });
}
let loaded = false;
// 진도를 다 읽었는지 (배지 알림이 예전에 얻은 배지를 새로 얻은 것처럼 띄우지 않게)
export const isLoaded = () => loaded;
export function loadProgress() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  done = readDone();
  seen = readSeen();
  cseen = readCseen();
  answers = readAnswers();
  game = readGame();
  syncScore();
  history.scrollRestoration = "manual";
  // Next.js가 기록에 남긴 표시(__NA)가 지워지면 뒤로가기 때 페이지가 새로고침되므로 합쳐서 쓴다
  history.replaceState({ ...history.state, ...place() }, "");
  window.addEventListener("popstate", onPopState);
  emit();
}

export const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getVersion = () => version;
export const getServerVersion = () => 0;
export const read = () => ({ S, L, done, seen, cseen, page, answers, game });

// 진도 파일 내보내기·불러오기 (기획서 v2 8절): 개인정보 없이 기기를 바꿀 때 쓴다. 서버로 보내지 않는다
export const PROGRESS_KIND = "code-block-classroom-progress";
export function exportProgress() {
  return { kind: PROGRESS_KIND, v: 1, savedAt: new Date().toISOString(), answers, done, seen, cseen, game };
}
const isObj = (o: unknown) => !!o && typeof o === "object" && !Array.isArray(o);
// 진도 파일을 지금 기록에 합친다. 지금 기록은 지우지 않고(첫 답도 지금 것을 유지), 파일에만 있는 기록을 더한다.
// 파일 모양이 틀리면 아무것도 바꾸지 않고 -1, 성공하면 새로 더한 기록 수(0 이상)를 돌려준다
export function importProgress(data: unknown): number {
  const d = data as Record<string, unknown>;
  if (!isObj(d) || d.kind !== PROGRESS_KIND || d.v !== 1) return -1;
  if (![d.answers, d.done, d.seen, d.cseen, d.game].every(isObj)) return -1;
  // 먼저 다른 탭이 저장한 기록을 합쳐 둔다(그래야 "새로 더한 기록 수"에 다른 탭 기록이 섞이지 않는다)
  answers = { ...answers, ...readAnswers() };
  done = { ...done, ...readDone() };
  seen = { ...seen, ...readSeen() };
  cseen = { ...cseen, ...readCseen() };
  game = mergeGame(game, readGame());
  const count = () => Object.keys(answers).length + Object.keys(done).length + Object.keys(seen).length + Object.keys(cseen).length + gameSize(game);
  const before = count();
  const fileAnswers = Object.fromEntries(
    Object.entries(d.answers as Record<string, unknown>).filter(([k, v]) => VALID_KEYS.has(k) && Array.isArray(v) && v.length === 2 && Number.isInteger(v[0]) && (v[1] === 0 || v[1] === 1)),
  ) as Record<string, [number, number]>;
  const g = cleanGame(d.game);
  answers = { ...fileAnswers, ...answers };
  done = { ...onlyOnes(d.done, (k) => TYPE_IDS.has(k)), ...done };
  seen = { ...onlyOnes(d.seen, (k) => BLOCK_IDS.has(k)), ...seen };
  cseen = { ...onlyOnes(d.cseen, (k) => LESSON_IDS.has(k)), ...cseen };
  game = mergeGame(g, game);
  store("cs-answers", answers);
  store("cs-done", done);
  store("cs-seen", seen);
  store("cs-cseen", cseen);
  store("cs-game", game);
  syncScore();
  // render()는 화면을 새로 만들어 "불러왔어요" 문구를 지우므로, 내용만 다시 그린다
  emit();
  return count() - before;
}
function render() {
  page++;
  emit();
}

// 처음 답한 문제만 점수에 넣는다. 다시 풀어도 점수는 그대로다
function tally(key: string, choice: number, ok: boolean) {
  // 다른 탭에서 저장한 답을 지우지 않게, 저장 직전에 다시 읽어 합친다
  answers = { ...answers, ...readAnswers() };
  if (!(key in answers)) {
    answers[key] = [choice, ok ? 1 : 0];
    store("cs-answers", answers);
  }
  syncScore();
}

export function go(v: View, extra?: Partial<ViewState>) {
  const from = placeKey();
  Object.assign(S, { view: v, ans: null }, extra || {});
  if (v === "lesson" && extra && "bi" in extra) {
    S.guess = prior(blockKey());
    L = {};
  }
  if (v === "chapter" && extra && ("ci" in extra || "ch" in extra)) S.cguess = prior(chapterKey());
  // 다른 화면으로 가면 기록을 쌓고, 번역기 칩·다음 미션처럼 같은 화면 안의 이동은 덮어쓴다
  if (placeKey() !== from) history.pushState({ ...history.state, ...place() }, "");
  else history.replaceState({ ...history.state, ...place() }, "");
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
export function setL(o: LabState) {
  Object.assign(L, o);
  emit();
}
export function guess(i: number) {
  S.guess = i;
  tally(blockKey(), i, i === BLOCKS[BORDER[S.bi]].hook.a);
  seen = { ...seen, ...readSeen(), [BORDER[S.bi]]: 1 }; // 다른 탭의 기록을 지우지 않게 다시 읽어 합친다
  store("cs-seen", seen);
  render();
}
export function cguess(i: number) {
  const lesson = CHAPTERS[S.ch].lessons[S.ci];
  S.cguess = i;
  tally(chapterKey(), i, i === lesson.hook.a);
  cseen = { ...cseen, ...readCseen(), [lesson.id]: 1 };
  store("cs-cseen", cseen);
  render();
}
export function keyAns(i: number, j: number) {
  const A = L.ans || {};
  A[i] = j;
  tally(`key:${i}`, j, j === KEY_LAB_ANSWERS[i]);
  setL({ ans: A });
}
export function answer(i: number, c: number) {
  S.ans = i;
  tally(`mission:${S.tid}:${S.mi}`, i, i === c);
  render();
}
export function finish(id: string) {
  done = { ...done, ...readDone(), [id]: 1 };
  store("cs-done", done);
  go("pick");
}
