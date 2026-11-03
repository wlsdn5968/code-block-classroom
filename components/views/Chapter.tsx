import { CHAPTER } from "@/lib/content";
import { cguess, go, read } from "@/lib/store";
import { Html } from "../Html";
import { Srcs } from "../Parts";

// 신규 챕터 "AI와 일하는 법" (2026-11-03). 블록 레슨(Lesson.tsx)과 같은 흐름: 맞혀보기 → 설명 → 한 줄 정리. 실험실 없음.
// data-new: 프로토타입에 없는 화면이라 동등성 검사에서 제외하는 표시.
export function Chapter() {
  const { S, cseen } = read();
  const lessons = CHAPTER.lessons;
  const l = lessons[S.ci],
    h = l.hook;
  const answered = S.cguess !== null,
    right = S.cguess === h.a;
  return (
    <section className="page" data-new="chapter">
      <span className="eyebrow">
        {CHAPTER.name} · {S.ci + 1} / {lessons.length}
      </span>
      <div className="parts">
        {lessons.map((x, i) => (
          <button key={x.id} className={`part ${i === S.ci ? "on" : ""} ${cseen[x.id] ? "seen" : ""}`} onClick={() => go("chapter", { ci: i })}>
            <span className="sw" style={{ background: "var(--ink)" }}></span>
            <b>{x.name}</b>
            <em>{x.word}</em>
          </button>
        ))}
      </div>
      <div className="bhead" style={{ background: "var(--ink)" }}>
        <h2>{l.name}</h2>
        <span>어른들 말로: {l.word}</span>
      </div>
      <div className="guess">
        <span className="eyebrow">먼저 맞혀보세요</span>
        <Html as="p" className="q" html={h.q} />
        <div className="opts">
          {h.opts.map((o, i) => {
            let c = "";
            if (answered) {
              if (i === h.a) c = "right";
              else if (i === S.cguess) c = "wrong";
            }
            return <Html as="button" key={i} className={`opt ${c}`} html={o} disabled={answered} onClick={() => cguess(i)} />;
          })}
        </div>
        {answered && (
          <div className={`reveal ${right ? "ok" : "no"}`}>
            <strong>{right ? "맞았어요" : "반전이 있죠"}</strong>
            <Html html={h.reveal} />
          </div>
        )}
      </div>
      {answered ? (
        <>
          {l.sections.map((s, i) => (
            <div className="sec" key={i}>
              <Html as="h3" html={`<span class="k">${String(i + 1).padStart(2, "0")}</span>${s.title}`} />
              <Html as="div" html={s.body} />
              <Srcs ids={s.sources} noSource={s.noSource} />
            </div>
          ))}
          <Html as="div" className="sum" html={`한 줄 정리 · ${l.sum}`} />
          <div className="row">
            <button className="btn alt" disabled={S.ci === 0} onClick={() => go("chapter", { ci: S.ci - 1 })}>
              이전 레슨
            </button>
            {S.ci < lessons.length - 1 ? (
              <button className="btn" onClick={() => go("chapter", { ci: S.ci + 1 })}>
                다음 레슨
              </button>
            ) : (
              <button className="btn" onClick={() => go("home")}>
                처음으로
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="lock">답을 고르면 자세한 설명이 열려요</div>
      )}
    </section>
  );
}
