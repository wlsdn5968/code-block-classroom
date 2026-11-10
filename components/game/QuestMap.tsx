// 홈의 학습 지도 (기획서 v2 4-1): 지역마다 칸 상태(○ 안 감, ● 답함, ★ 첫 답에 맞힘)와 "다음에 할 것" 단추.
// 프로토타입에 없는 요소라 data-new로 표시한다(동등성 검사에서 제외)
import { levelOf, nextStep, regionsOf, reviewKeys, xpOf } from "@/lib/game";
import { KitLinks } from "./KitLinks";
import { go, read } from "@/lib/store";

const MARK = ["○", "●", "★"] as const;
const SAY = ["아직 안 감", "답함", "첫 답에 맞힘"] as const;

export function QuestMap() {
  const r = read();
  const regions = regionsOf(r);
  const next = nextStep(regions);
  const xp = xpOf(r.answers, r.game);
  const lv = levelOf(xp);
  const all = regions.flatMap((g) => g.cells);
  const doneN = all.filter((c) => c.state > 0).length;
  return (
    <div className="qmap" data-new="game">
      <div className="qhead">
        <button className="qlv" onClick={() => go("me")}>
          <b>Lv.{lv.n} {lv.name}</b>
          <span>{xp} XP{lv.next !== null ? ` · 다음 레벨까지 ${lv.toNext}` : " · 최고 레벨"}</span>
        </button>
        <span className="qcount">
          지도 {doneN}/{all.length}칸
        </span>
      </div>
      {next ? (
        <button className="btn qnext" onClick={() => go(...next.cell.to)}>
          다음에 할 것: {next.region} · {next.cell.name} →
        </button>
      ) : (
        <button className="btn qnext" onClick={() => go("me")}>
          지도를 모두 돌았어요! 내 기록 보기 →
        </button>
      )}
      <ol className="regions">
        {regions.map((g, gi) => {
          const n = g.cells.filter((c) => c.state > 0).length;
          return (
            <li key={g.id} className={`region ${n === g.cells.length ? "clear" : ""}`}>
              <button className="rname" onClick={() => go(...g.to)}>
                <span className="rnum">{gi + 1}</span>
                <b>{g.name}</b>
                <span>{g.sub}</span>
                <i>
                  {n}/{g.cells.length}
                </i>
              </button>
              <div className="cells">
                {g.cells.map((c, i) => (
                  <button key={i} className={`cell s${c.state}`} onClick={() => go(...c.to)} aria-label={`${g.name} ${c.name}: ${SAY[c.state]}`} title={`${c.name} · ${SAY[c.state]}`}>
                    {MARK[c.state]}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
      <KitLinks left={reviewKeys(r).length} />
      <p className="qlegend">○ 아직 안 감 · ● 답함 · ★ 첫 답에 맞힘 · 순서는 추천일 뿐, 어디부터 가도 돼요</p>
    </div>
  );
}
