import { TYPES } from "@/lib/content";
import { go, read } from "@/lib/store";

export function Pick() {
  const { done } = read();
  return (
    <section className="page">
      <span className="eyebrow">무엇을 만들고 싶어요?</span>
      <h2>고르면 필요한 블록, 돌아가는 순서, AI 감독 미션이 나와요</h2>
      <div className="types">
        {TYPES.map((t) => (
          <button key={t.id} className={`type ${done[t.id] ? "done" : ""}`} onClick={() => go("type", { tid: t.id, tab: 0, mi: 0 })}>
            <span className="ico">{t.ico}</span>
            <b>{t.name}</b>
            <span>{t.sub}</span>
          </button>
        ))}
      </div>
      <p className="note">
        블록이 낯설면 먼저{" "}
        <button className="btn sm alt" onClick={() => go("lesson", { bi: 0 })}>
          블록 9개 배우기
        </button>
        를 보고 오세요.
      </p>
    </section>
  );
}
