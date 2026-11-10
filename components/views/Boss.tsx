// 챕터 보스 "승인할까요?" (기획서 v2 4-5): AI가 보낸 것 같은 말을 차례로 보고, 그대로 승인할지 멈추고 확인할지 고른다.
// 문제는 content/game/boss.json. 레슨의 출처 범위 안에서 쓴 문장이고 해설마다 출처가 붙는다.
// 점수판(첫 답)에는 들어가지 않는다. 가장 높은 별 수만 남고, 별 1개에 경험치 20
"use client";
import { useEffect, useState } from "react";
import { CHAPTERS } from "@/lib/content";
import { BOSS, CHAPTER_REGIONS, bossStars } from "@/lib/game";
import { bossDone, go, read } from "@/lib/store";
import { Html } from "../Html";
import { Srcs } from "../Parts";

const OPTS = ["✅ 그대로 승인", "✋ 멈추고 확인"];

export function Boss() {
  const { S, game } = read();
  // 없는 챕터 번호면 보스가 없는 것으로 다룬다(다른 챕터에 기록이 남지 않게)
  const C = CHAPTERS[S.ch];
  const items = (C && BOSS[C.id]) || [];
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const finished = items.length > 0 && picks.length === items.length && i === items.length;
  const right = picks.filter((p, n) => items[n] && p === (items[n].ok ? 0 : 1)).length;
  const stars = bossStars(right, items.length);
  const cid = C?.id ?? "";
  useEffect(() => {
    if (finished) bossDone(cid, stars);
  }, [finished, cid, stars]);
  const best = game.boss[cid] ?? 0;
  const starText = (n: number) => "★".repeat(n) + "☆".repeat(3 - n);

  if (!items.length)
    return (
      <section className="page" data-new="game">
        <p className="lead">이 지역에는 아직 보스가 없어요.</p>
        <button className="btn" onClick={() => go("home")}>
          지도로
        </button>
      </section>
    );
  if (finished)
    return (
      <section className="page" data-new="game">
        <span className="eyebrow">{CHAPTER_REGIONS[S.ch] ?? C?.name} · 보스</span>
        <h2>승인할까요? 결과</h2>
        <div className="bossres" role="status">
          <span className="stars" role="img" aria-label={`별 3개 중 ${stars}개`}>
            {starText(stars)}
          </span>
          <p>
            {items.length}문제 중 <b>{right}개</b>를 맞혔어요. {stars === 3 ? "모두 맞혔어요!" : "다시 도전하면 별을 더 받을 수 있어요."}
          </p>
          <p className="lead">가장 높은 기록: {starText(Math.max(best, stars))} · 별 1개에 경험치 20</p>
        </div>
        <div className="row">
          <button
            className="btn alt"
            onClick={() => {
              setI(0);
              setPicks([]);
            }}
          >
            다시 도전
          </button>
          <button className="btn" onClick={() => go("home")}>
            지도로
          </button>
        </div>
      </section>
    );

  const m = items[i];
  const correct = m.ok ? 0 : 1;
  const p = picks[i];
  const done = p !== undefined;
  return (
    <section className="page" data-new="game">
      <span className="eyebrow">{CHAPTER_REGIONS[S.ch] ?? C?.name} · 보스</span>
      <h2>승인할까요?</h2>
      <p className="lead">
        AI가 이렇게 말했어요. 그대로 승인해도 되는지, 멈추고 확인해야 하는지 골라 보세요. {i + 1} / {items.length}
        {best > 0 && ` · 가장 높은 기록 ${starText(best)}`}
      </p>
      <Html as="div" className="bub" html={`<span class="who">AI가 승인을 기다려요</span>${m.say}`} />
      <div className="row">
        {OPTS.map((o, n) => (
          <button key={n} className={`opt ${done ? (n === correct ? "right" : n === p ? "wrong" : "") : ""}`} disabled={done} onClick={() => setPicks((x) => (x.length === i ? [...x, n] : x))}>
            {o}
          </button>
        ))}
      </div>
      <div role="status" aria-live="polite">
        {done && (
          <div className={`reveal ${p === correct ? "ok" : "no"}`}>
            <strong>{(p === correct ? "정답이에요" : "다시 볼까요") + ` · ${m.ok ? "그대로 승인" : "멈추고 확인"}이 맞아요`}</strong>
            <Html html={m.why} />
            <Srcs ids={m.sources} />
          </div>
        )}
      </div>
      {done && (
        <button className="btn" onClick={() => setI(i + 1)}>
          {i < items.length - 1 ? "다음 문제" : "결과 보기"}
        </button>
      )}
    </section>
  );
}
