// 화면 상태 저장소. 프로토타입의 S(화면 상태)·L(실험실 상태)·done·seen과 같은 규칙으로 움직인다.
// React 밖의 작은 저장소로 두고 useSyncExternalStore로 화면을 다시 그린다.
import { BLOCKS, BORDER, CHAPTER } from "./content";
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
let loaded = false;
export function loadProgress() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  done = load("cs-done", "{}");
  seen = load("cs-seen", "{}");
  cseen = load("cs-cseen", "{}");
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

function tally(ok: boolean) {
  S.max++;
  if (ok) S.score++;
}

export function go(v: View, extra?: Partial<ViewState>) {
  Object.assign(S, { view: v, ans: null }, extra || {});
  if (v === "lesson" && extra && "bi" in extra) {
    S.guess = null;
    L = {};
  }
  if (v === "chapter" && extra && "ci" in extra) S.cguess = null;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
export function setL(o: LabState) {
  Object.assign(L, o);
  emit();
}
// 프로토타입의 oninput="L.amt=this.value;L.res=null": 값만 바꾸고 다시 그리지 않는다
export function mutateL(o: LabState) {
  Object.assign(L, o);
}
export function guess(i: number) {
  S.guess = i;
  tally(i === BLOCKS[BORDER[S.bi]].hook.a);
  seen[BORDER[S.bi]] = 1;
  store("cs-seen", seen);
  render();
}
export function cguess(i: number) {
  const lesson = CHAPTER.lessons[S.ci];
  S.cguess = i;
  tally(i === lesson.hook.a);
  cseen[lesson.id] = 1;
  store("cs-cseen", cseen);
  render();
}
export function keyAns(i: number, j: number) {
  const A = L.ans || {};
  A[i] = j;
  tally(j === KEY_LAB_ANSWERS[i]);
  setL({ ans: A });
}
export function answer(i: number, c: number) {
  S.ans = i;
  tally(i === c);
  render();
}
export function finish(id: string) {
  done[id] = 1;
  store("cs-done", done);
  go("pick");
}
