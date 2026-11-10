import { BORDER, CHAPTERS, PHRASES, TYPES } from "@/lib/content";
import { go, read } from "@/lib/store";
import { Brick } from "../Parts";
import { QuestMap } from "../game/QuestMap";

export function Home() {
  const { done, seen, cseen } = read();
  const nb = Object.keys(seen).length,
    nt = Object.keys(done).length,
    nc = CHAPTERS.map((c) => c.lessons.filter((l) => cseen[l.id]).length);
  return (
    <section className="page">
      <span className="eyebrow">AI랑 만들 때 답답했던 그 순간을 위한 교실</span>
      <h1>AI가 &quot;이거 추가할게요&quot; 할 때, 그게 뭔지 알면 덜 답답해요</h1>
      <p className="big">
        대시보드도, 게임도, 자동매매봇도 <b>같은 블록 9개</b> 중 몇 개를 골라 조립한 거예요. 블록을 알면 AI가 뭘 하자는 건지 보이기 시작해요.
      </p>
      <div className="bricks">
        {BORDER.map((k) => (
          <Brick key={k} id={k} />
        ))}
      </div>
      <QuestMap />
      <div className="menu">
        <button className="mi" onClick={() => go("lesson", { bi: 0 })}>
          <span className="n">1</span>
          <span>
            <b>블록 9개 배우기</b>
            <span>먼저 맞혀보고, 풀어보고, 직접 만져보기</span>
          </span>
          <i>
            {nb}/{BORDER.length}
          </i>
        </button>
        <button className="mi" onClick={() => go("pick")}>
          <span className="n">2</span>
          <span>
            <b>만들고 싶은 것 고르기</b>
            <span>대시보드·게임·봇·AI챗봇·결제·SNS·디자인</span>
          </span>
          <i>
            {nt}/{TYPES.length}
          </i>
        </button>
        <button className="mi" onClick={() => go("words")}>
          <span className="n">3</span>
          <span>
            <b>AI 말 번역기</b>
            <span>AI가 자주 하는 말 {PHRASES.length}개, 무슨 뜻이고 뭘 확인할지</span>
          </span>
          <i>사전</i>
        </button>
        <button className="mi" onClick={() => go("rules")}>
          <span className="n">4</span>
          <span>
            <b>공통 규칙 3가지와 출처</b>
            <span>무엇을 만들든 지킬 것</span>
          </span>
          <i>요약</i>
        </button>
        {/* 신규 챕터 (2026-11-03). 프로토타입에 없는 항목이라 data-new로 표시 */}
        {/* 챕터 2 '만든 다음에 터지는 것들' (2026-11-09)은 6번 */}
        {CHAPTERS.map((c, ch) => (
          <button key={c.id} className="mi" data-new="chapter" onClick={() => go("chapter", { ch, ci: 0 })}>
            <span className="n">{5 + ch}</span>
            <span>
              <b>{c.name}</b>
              <span>{c.sub}</span>
            </span>
            <i>
              {nc[ch]}/{c.lessons.length}
            </i>
          </button>
        ))}
      </div>
    </section>
  );
}
