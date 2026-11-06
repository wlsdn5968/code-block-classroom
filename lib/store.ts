// 화면 상태 저장소. 프로토타입의 S(화면 상태)·L(실험실 상태)·done·seen과 같은 규칙으로 움직인다.
// React 밖의 작은 저장소로 두고 useSyncExternalStore로 화면을 다시 그린다.
import { BLOCKS, BORDER, CHAPTER, TYPES } from "./content";
import { KEY_LAB_ANSWERS } from "./keyLab";

export type View = "home" | "lesson" | "pick" | "type" | "words" | "rules" | "chapter";
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
  // 신규 챕터: 레슨 번호와 맞혀보기 선택 (블록의 bi·guess와 같은 규칙)
  ci: number;
  cguess: number | null;
};
// 실험실마다 쓰는 값이 달라서 느슨한 모양으로 둔다 (프로토타입의 L과 같음)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LabState = Record<string, any>;

const S: ViewState = { view: "home", bi: 0, guess: null, tid: null, tab: 0, mi: 0, ans: null, score: 0, max: 0, filter: "all", ci: 0, cguess: null };
let L: LabState = {};
let done: Record<string, number> = {};
let seen: Record<string, number> = {};
let cseen: Record<string, number> = {}; // 챕터 진도 (localStorage "cs-cseen")
// 문제마다 첫 답만 기록한다 (localStorage "cs-answers"): 문제 키 → [고른 답 번호, 맞으면 1]. 점수는 여기서 센다
let answers: Record<string, [number, number]> = {};
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
const place = () => ({ view: S.view, bi: S.bi, tid: S.tid, tab: S.tab, mi: S.mi, filter: S.filter, ci: S.ci });
const placeKey = () => [S.view, S.bi, S.tid, S.tab, S.ci].join("|");
const blockKey = () => `block:${BORDER[S.bi]}`;
const chapterKey = () => `chapter:${CHAPTER.lessons[S.ci]?.id}`;
// 이미 푼 블록·챕터 레슨은 고른 답을 되살려 설명을 열어 둔다 (복습)
const prior = (key: string) => answers[key]?.[0] ?? null;
// 지금 콘텐츠에 있는 문제의 키만 센다 (지운 문제의 옛 기록은 버린다)
const VALID_KEYS = new Set([
  ...BORDER.map((id) => `block:${id}`),
  ...CHAPTER.lessons.map((l) => `chapter:${l.id}`),
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
function syncScore() {
  const all = Object.values(answers);
  S.max = all.length;
  S.score = all.filter((a) => a[1] === 1).length;
}
function onPopState(e: PopStateEvent) {
  if (!e.state?.view) return;
  const { view, bi, tid, tab, mi, filter, ci } = e.state;
  Object.assign(S, { view, bi, tid, tab, mi, filter, ci, ans: null });
  S.guess = prior(blockKey());
  S.cguess = prior(chapterKey());
  L = {};
  render();
  window.scrollTo({ top: 0 });
}
let loaded = false;
export function loadProgress() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  done = load("cs-done", "{}");
  seen = load("cs-seen", "{}");
  cseen = load("cs-cseen", "{}");
  answers = readAnswers();
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
export const read = () => ({ S, L, done, seen, cseen, page });
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
  if (v === "chapter" && extra && "ci" in extra) S.cguess = prior(chapterKey());
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
  seen[BORDER[S.bi]] = 1;
  store("cs-seen", seen);
  render();
}
export function cguess(i: number) {
  const lesson = CHAPTER.lessons[S.ci];
  S.cguess = i;
  tally(chapterKey(), i, i === lesson.hook.a);
  cseen[lesson.id] = 1;
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
  done[id] = 1;
  store("cs-done", done);
  go("pick");
}
