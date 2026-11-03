import { BLOCKS, BORDER, TYPES } from "@/lib/content";
import { answer, finish, go, read } from "@/lib/store";
import { Html } from "../Html";
import { Brick, Srcs } from "../Parts";

export function TypeView() {
  const { S } = read();
  const t = TYPES.find((x) => x.id === S.tid)!;
  const tabs = ["조립도", "돌아가는 순서", "AI 감독 미션"];
  let body: React.ReactNode;
  if (S.tab === 0) {
    const order = BORDER.slice().sort((a, b) => t.asm[b].level - t.asm[a].level);
    const lv = ["필요 없음", "상황 따라", "꼭 필요"],
      cl = ["no", "maybe", "need"];
    body = (
      <>
        <div className="guess">
          <span className="eyebrow">생각해보기</span>
          <Html as="p" className="q" html={t.hook} />
        </div>
        <Html as="p" className="big" html={t.intro} />
        <div className="legend">
          <span>
            <i style={{ background: "var(--ink)" }}></i>꼭 필요
          </span>
          <span>
            <i style={{ border: "2px dashed var(--ink)" }}></i>상황 따라
          </span>
          <span>
            <i style={{ background: "#9aa19d" }}></i>필요 없음
          </span>
        </div>
        <div className="asm">
          {order.map((k) => {
            const { level: l, reason: r } = t.asm[k];
            return (
              <div key={k} className={`r ${cl[l]}`}>
                <div>
                  <button
                    className="brickbtn"
                    style={{ all: "unset", cursor: "pointer" }}
                    onClick={() => go("lesson", { bi: BORDER.indexOf(k) })}
                    aria-label={`${BLOCKS[k].name} 블록 배우기`}
                  >
                    <Brick id={k} />
                  </button>
                  <span className="tag">{lv[l]}</span>
                </div>
                <Html as="p" html={r} />
              </div>
            );
          })}
        </div>
        <p className="lead">블록 이름을 누르면 그 블록 수업으로 가요.</p>
        <button className="btn" onClick={() => go("type", { tab: 1 })}>
          돌아가는 순서 보기
        </button>
      </>
    );
  } else if (S.tab === 1) {
    body = (
      <>
        <p className="lead">{t.name}이(가) 한 번 일할 때 일어나는 일이에요.</p>
        <ol className="flow">
          {t.flow.map((f, i) => (
            <li key={i}>
              <Html html={f} />
            </li>
          ))}
        </ol>
        {t.flowSources && <Srcs ids={t.flowSources} />}
        <button className="btn" onClick={() => go("type", { tab: 2, mi: 0 })}>
          AI 감독 미션 시작
        </button>
      </>
    );
  } else {
    const m = t.missions[S.mi],
      isAI = m.k === "ai";
    const opts = m.k === "ai" ? ["✅ 승인", "✋ 거절"] : m.opts;
    const correct = m.k === "ai" ? (m.ok ? 0 : 1) : m.a,
      right = S.ans === correct;
    body = (
      <>
        <p className="lead">
          미션 {S.mi + 1} / {t.missions.length}
        </p>
        {m.k === "ai" ? (
          <Html as="div" className="bub" html={`<span class="who">AI가 승인을 기다려요</span>${m.say}`} />
        ) : (
          <Html as="p" className="q" style={{ fontSize: "18px", fontWeight: 700 }} html={m.q} />
        )}
        <div className={isAI ? "row" : "opts"}>
          {opts.map((o, i) => {
            let c = "";
            if (S.ans !== null) {
              if (i === correct) c = "right";
              else if (i === S.ans) c = "wrong";
            }
            return <Html as="button" key={i} className={`opt ${c}`} html={o} disabled={S.ans !== null} onClick={() => answer(i, correct)} />;
          })}
        </div>
        {S.ans !== null && (
          <>
            <div className={`reveal ${right ? "ok" : "no"}`}>
              <strong>
                {(right ? "정답이에요" : "다시 볼까요") + (m.k === "ai" ? ` · ${m.ok ? "승인" : "거절"}이 맞아요` : "")}
              </strong>
              <Html html={m.why} />
              <Srcs ids={m.sources} />
            </div>
            {S.mi < t.missions.length - 1 ? (
              <button className="btn" onClick={() => go("type", { mi: S.mi + 1 })}>
                다음 미션
              </button>
            ) : (
              <button className="btn" onClick={() => finish(t.id)}>
                완료하고 다른 것 고르기
              </button>
            )}
          </>
        )}
      </>
    );
  }
  return (
    <section className="page">
      <span className="eyebrow">
        {t.ico} {t.name}
      </span>
      <div className="tabs">
        {tabs.map((x, i) => (
          <button key={i} className={i === S.tab ? "on" : ""} onClick={() => go("type", { tab: i, mi: 0 })}>
            {i + 1}. {x}
          </button>
        ))}
      </div>
      {body}
    </section>
  );
}
