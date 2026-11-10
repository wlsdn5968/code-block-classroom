// 복습함 (기획서 v2 4-6): 첫 답이 틀렸던 문제를 다시 푼다. 다시 맞히면 복습함에서 빠지고 경험치 5를 받는다.
// 점수판(첫 답)은 바뀌지 않는다. 문제·보기·해설은 원래 화면의 것을 그대로 쓴다(새 문장 없음)
"use client";
import { useState } from "react";
import { BLOCKS, LESSONS, TYPES } from "@/lib/content";
import { reviewKeys, reviewedKeys } from "@/lib/game";
import { go, read, reviewDone } from "@/lib/store";
import { Html } from "../Html";
import { Srcs } from "../Parts";
import { KEY_ITEMS } from "../labs/KeyLab";

type Q = { where: string; q: React.ReactNode; opts: string[]; a: number; why: React.ReactNode };
function question(key: string): Q | null {
  const [kind, id, n] = key.split(":");
  if (kind === "block" && BLOCKS[id]) {
    const h = BLOCKS[id].hook;
    return { where: `블록 · ${BLOCKS[id].name}`, q: <Html as="p" className="q" html={h.q} />, opts: h.opts, a: h.a, why: <Html html={h.reveal} /> };
  }
  if (kind === "chapter" && LESSONS[id]) {
    const h = LESSONS[id].hook;
    return { where: `레슨 · ${LESSONS[id].name}`, q: <Html as="p" className="q" html={h.q} />, opts: h.opts, a: h.a, why: <Html html={h.reveal} /> };
  }
  if (kind === "mission") {
    const t = TYPES.find((x) => x.id === id);
    const m = t?.missions[Number(n)];
    if (!t || !m) return null;
    const why = (
      <>
        <Html html={m.why} />
        <Srcs ids={m.sources} noSource={m.noSource} />
      </>
    );
    if (m.k === "ai") return { where: `미션 · ${t.name}`, q: <Html as="div" className="bub" html={`<span class="who">AI가 승인을 기다려요</span>${m.say}`} />, opts: ["✅ 승인", "✋ 거절"], a: m.ok ? 0 : 1, why };
    return { where: `미션 · ${t.name}`, q: <Html as="p" className="q" html={m.q} />, opts: m.opts, a: m.a, why };
  }
  if (kind === "key" && KEY_ITEMS[Number(id)]) {
    const k = KEY_ITEMS[Number(id)];
    return {
      where: "실험실 · 열쇠 분류하기",
      q: (
        <p className="q">
          이 열쇠는 어디에 둬야 할까요? {k.n} <code>{k.c}</code>
        </p>
      ),
      opts: ["화면에 둬도 됨", "서버에만"],
      a: k.a,
      why: <span>{k.w}</span>,
    };
  }
  return null;
}

export function Review() {
  const r = read();
  // 들어올 때 남아 있던 문제를 붙잡아 둔다(다시 맞혀도 나갈 때까지는 해설을 보여 준다)
  const [keys] = useState(() => reviewKeys(r));
  const [picked, setPicked] = useState<Record<string, number>>({});
  const left = reviewKeys(r).length;
  const everWrong = Object.values(r.answers).some((a) => a[1] === 0);
  const pick = (key: string, i: number, a: number) => {
    setPicked((p) => ({ ...p, [key]: i }));
    if (i === a) reviewDone(key);
  };
  return (
    <section className="page" data-new="game">
      <span className="eyebrow">복습함</span>
      <h2>틀렸던 문제를 다시 풀어요</h2>
      <p className="lead">
        남은 문제 {left}개 · 다시 맞힌 문제 {reviewedKeys(r.answers, r.game).length}개. 다시 맞히면 경험치 5를 받아요. 틀려도 점수는 깎이지 않아요.
      </p>
      {keys.length === 0 && <div className="out ok">{everWrong ? "틀렸던 문제를 모두 다시 맞혔어요!" : "아직 틀린 문제가 없어요. 문제를 풀다가 틀리면 여기에 모여요."}</div>}
      {keys.map((key) => {
        const q = question(key);
        if (!q) return null;
        const p = picked[key];
        const done = p !== undefined;
        return (
          <div className="guess rv" key={key} data-key={key}>
            <span className="eyebrow">{q.where}</span>
            {q.q}
            <div className="opts">
              {q.opts.map((o, i) => (
                <Html as="button" key={i} className={`opt ${done ? (i === q.a ? "right" : i === p ? "wrong" : "") : ""}`} html={o} disabled={done} onClick={() => pick(key, i, q.a)} />
              ))}
            </div>
            {done && (
              <div className={`reveal ${p === q.a ? "ok" : "no"}`} role="status">
                <strong>{p === q.a ? "이번엔 맞았어요" : "아직이에요. 다음에 다시 풀어요"}</strong>
                {q.why}
              </div>
            )}
          </div>
        );
      })}
      <div className="row">
        <button className="btn alt" onClick={() => go("me")}>
          내 기록으로
        </button>
        <button className="btn alt" onClick={() => go("home")}>
          지도로
        </button>
      </div>
    </section>
  );
}
