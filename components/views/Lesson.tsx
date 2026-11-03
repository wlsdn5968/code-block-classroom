import { BLOCKS, BORDER } from "@/lib/content";
import { go, guess, read } from "@/lib/store";
import { Html } from "../Html";
import { Srcs } from "../Parts";
import { LABS } from "../labs";

export function Lesson() {
  const { S, seen } = read();
  const k = BORDER[S.bi],
    b = BLOCKS[k],
    h = b.hook;
  const answered = S.guess !== null,
    right = S.guess === h.a;
  const Lab = LABS[b.lab];
  return (
    <section className="page">
      <span className="eyebrow">블록 {S.bi + 1} / 9</span>
      <div className="parts">
        {BORDER.map((id, i) => (
          <button key={id} className={`part ${i === S.bi ? "on" : ""} ${seen[id] ? "seen" : ""}`} onClick={() => go("lesson", { bi: i })}>
            <span className="sw" style={{ background: `var(--b-${id})` }}></span>
            <b>{BLOCKS[id].name}</b>
            <em>{BLOCKS[id].word}</em>
          </button>
        ))}
      </div>
      <div className="bhead" style={{ background: `var(--b-${k})` }}>
        <h2>{b.name}</h2>
        <span>어른들 말로: {b.word}</span>
      </div>
      <div className="guess">
        <span className="eyebrow">먼저 맞혀보세요</span>
        <Html as="p" className="q" html={h.q} />
        <div className="opts">
          {h.opts.map((o, i) => {
            let c = "";
            if (answered) {
              if (i === h.a) c = "right";
              else if (i === S.guess) c = "wrong";
            }
            return <Html as="button" key={i} className={`opt ${c}`} html={o} disabled={answered} onClick={() => guess(i)} />;
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
          {b.sections.map((s, i) => (
            <div className="sec" key={i}>
              <Html as="h3" html={`<span class="k">${String(i + 1).padStart(2, "0")}</span>${s.title}`} />
              <Html as="div" html={s.body} />
              <Srcs ids={s.sources} />
            </div>
          ))}
          <div id="lab">
            <Lab />
          </div>
          <Html as="div" className="sum" html={`한 줄 정리 · ${b.sum}`} />
          <div className="row">
            <button className="btn alt" disabled={S.bi === 0} onClick={() => go("lesson", { bi: S.bi - 1 })}>
              이전 블록
            </button>
            {S.bi < 8 ? (
              <button className="btn" onClick={() => go("lesson", { bi: S.bi + 1 })}>
                다음 블록
              </button>
            ) : (
              <button className="btn" onClick={() => go("pick")}>
                만들 것 고르기
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="lock">답을 고르면 자세한 설명과 실험실이 열려요</div>
      )}
    </section>
  );
}
