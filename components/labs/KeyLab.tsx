import { KEY_LAB_ANSWERS } from "@/lib/keyLab";
import { keyAns, read } from "@/lib/store";
import { LabBox } from "./LabBox";

// 실험실 6 · 열쇠 분류하기. 키 값은 모두 가짜이고 잘려 있다 (예시).
// 정답(a)은 lib/keyLab.ts의 KEY_LAB_ANSWERS에서 가져온다. 채점(store.keyAns)도 같은 표를 쓴다.
// 복습함(components/views/Review.tsx)도 같은 표를 쓴다
export const KEY_ITEMS = [
  { c: "sb_publishable_9fK2…", n: "Supabase publishable 키", a: KEY_LAB_ANSWERS[0], w: "화면에 둬도 돼요. 대신 RLS가 무엇을 볼 수 있는지 막아줘요." },
  { c: "sb_secret_Zx3P…", n: "Supabase secret 키", a: KEY_LAB_ANSWERS[1], w: "모든 RLS를 무시해요. 브라우저에 절대 두지 말라고 Supabase가 경고해요." },
  { c: "test_ck_D5Ge…", n: "토스페이먼츠 클라이언트 키", a: KEY_LAB_ANSWERS[2], w: "브라우저에서 결제창(SDK)을 시작할 때 쓰는 키예요." },
  { c: "test_sk_zXLk…", n: "토스페이먼츠 시크릿 키", a: KEY_LAB_ANSWERS[3], w: "테스트 키여도 시크릿 키는 노출하지 말라고 토스페이먼츠가 안내해요." },
  { c: "sk-ant-api03-…", n: "Claude API 키", a: KEY_LAB_ANSWERS[4], w: "가져간 사람이 내 요금으로 AI를 써요. 서버에만 둬요." },
  { c: "NEXT_PUBLIC_TOSS_SECRET=test_sk_…", n: "이름표가 붙은 시크릿 키", a: KEY_LAB_ANSWERS[5], w: "함정이에요. NEXT_PUBLIC_이 붙으면 화면 코드로 배달돼요. 시크릿이니 이름표를 떼고 서버에서만 써야 해요." },
];

export function KeyLab() {
  const { L } = read();
  const A: Record<number, number> = L.ans || {};
  const n = KEY_ITEMS.filter((k, i) => A[i] === k.a).length,
    total = Object.keys(A).length;
  return (
    <LabBox title="열쇠 분류하기">
      <p>각 열쇠를 어디에 둬야 할지 골라보세요.</p>
      <div className="keys">
        {KEY_ITEMS.map((k, i) => {
          const d = A[i] !== undefined;
          return (
            <div className="kc" key={i}>
              <span>
                <b>{k.n}</b>
                <br />
                <code>{k.c}</code>
              </span>
              <div className="ctrl">
                {["화면에 둬도 됨", "서버에만"].map((t, j) => (
                  <button key={j} className={`tog ${d && j === k.a ? "on" : ""}`} disabled={d} onClick={() => keyAns(i, j)}>
                    {t}
                  </button>
                ))}
              </div>
              {d && <div className={`out ${A[i] === k.a ? "ok" : "no"}`}>{(A[i] === k.a ? "맞아요. " : "반대예요. ") + k.w}</div>}
            </div>
          );
        })}
      </div>
      {total === KEY_ITEMS.length && (
        <div className="out nt">
          {KEY_ITEMS.length}개 중 {n}개 맞혔어요.
        </div>
      )}
    </LabBox>
  );
}
