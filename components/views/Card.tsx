// 나의 AI 안전 수칙 카드 (기획서 v2 5장 ①): 맞혀보기에 답한 레슨의 한 줄 정리가 지역별 카드에 붙는다.
// 그림(PNG)은 이 브라우저 안에서 그려 내려받는다. 서버로 보내지 않는다
"use client";
import { useState } from "react";
import { drawCard } from "@/lib/card";
import { saveBlob, today } from "@/lib/download";
import { ruleGroups, runs, type RuleGroup } from "@/lib/kit";
import { go, read } from "@/lib/store";
import { Html } from "../Html";

export function Card() {
  const { seen, cseen } = read();
  const groups = ruleGroups(seen, cseen);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async (g: RuleGroup) => {
    if (busy) return; // 그리는 동안 또 누르면 파일이 두 번 받아진다
    setBusy(true);
    try {
      const got = g.rules.filter((x) => x.got);
      const day = today();
      const blob = await drawCard({ title: "나의 AI 안전 수칙", sub: `${g.name} · ${got.length}/${g.rules.length}`, rules: got.map((x) => runs(x.html)), footer: `코드 블록 교실 · ${day}` });
      saveBlob(blob, `ai-safety-card-${g.id}-${day}.png`);
      setMsg({ ok: true, text: `'${g.name}' 카드를 그림으로 저장했어요.` });
    } catch {
      setMsg({ ok: false, text: "그림을 만들지 못했어요. 다른 브라우저에서 다시 해 보세요." });
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="page" data-new="game">
      <span className="eyebrow">내 가방 · 수칙 카드</span>
      <h2>나의 AI 안전 수칙</h2>
      <p className="lead">레슨의 맞혀보기에 답할 때마다 그 레슨의 한 줄 정리가 카드에 붙어요. 그림으로 저장해 책상 옆에 붙여 두세요.</p>
      <div role="status" aria-live="polite">
        {msg && <div className={`out ${msg.ok ? "ok" : "no"}`}>{msg.text}</div>}
      </div>
      {groups.map((g) => {
        const n = g.rules.filter((x) => x.got).length;
        return (
          <div className="rcard" key={g.id} data-group={g.id}>
            <div className="rhead">
              <b>{g.name}</b>
              <span>
                {n}/{g.rules.length}
              </span>
            </div>
            <ol>
              {g.rules.map((x) =>
                x.got ? (
                  <li key={x.id}>
                    <Html html={x.html} />
                  </li>
                ) : (
                  <li key={x.id} className="lock">
                    🔒 아직 · {x.name}
                  </li>
                ),
              )}
            </ol>
            <button className="btn sm" disabled={n === 0 || busy} onClick={() => save(g)} aria-label={`${g.name} 카드를 그림으로 저장`}>
              그림으로 저장
            </button>
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
