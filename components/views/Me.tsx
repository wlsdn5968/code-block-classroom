// "내 기록" 화면 (기획서 v2 M1): 레벨·경험치 막대, 배지, 진도 파일 저장·불러오기.
// 진도 파일은 이 브라우저 안에서만 만들고 읽는다. 서버로 보내지 않는다
"use client";
import { useRef, useState } from "react";
import { saveBlob, today } from "@/lib/download";
import { BADGES, LEVELS, hasBadge, levelOf, reviewKeys, xpOf } from "@/lib/game";
import { KitLinks } from "../game/KitLinks";
import { exportProgress, go, importProgress, read } from "@/lib/store";

export function Me() {
  const r = read();
  const xp = xpOf(r.answers, r.game);
  const lv = levelOf(xp);
  const got = BADGES.filter((b) => hasBadge(b, r)).length;
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const from = LEVELS[lv.n - 1].min;
  const pct = lv.next === null ? 100 : Math.round(((xp - from) / (lv.next - from)) * 100);

  const save = () => {
    const blob = new Blob([JSON.stringify(exportProgress(), null, 2)], { type: "application/json" });
    saveBlob(blob, `code-block-classroom-progress-${today()}.json`);
    setMsg({ ok: true, text: "진도 파일을 저장했어요. 다른 기기에서 '불러오기'로 이어 하세요." });
  };
  const open = async (f: File | undefined) => {
    if (!f) return;
    let added = -1;
    try {
      added = importProgress(JSON.parse(await f.text()));
    } catch {}
    setMsg(
      added < 0
        ? { ok: false, text: "이 사이트의 진도 파일이 아니에요. 아무것도 바꾸지 않았어요." }
        : { ok: true, text: added ? `진도를 지금 기록에 합쳤어요. 새로 더한 기록 ${added}개.` : "진도를 지금 기록에 합쳤어요. 새로 더할 기록은 없었어요." },
    );
    if (file.current) file.current.value = "";
  };

  return (
    <section className="page" data-new="game">
      <span className="eyebrow">내 기록</span>
      <h2>
        Lv.{lv.n} {lv.name}
      </h2>
      <p className="lead">{lv.mean}</p>
      <div className="xpbar" role="img" aria-label={`경험치 ${xp}, 다음 레벨까지 ${lv.toNext}`}>
        <span style={{ width: `${pct}%` }}></span>
      </div>
      <p className="xpnote">
        {xp} XP{lv.next !== null ? ` · 다음 레벨(${LEVELS[lv.n].name})까지 ${lv.toNext} XP` : " · 최고 레벨이에요"} · 첫 답에 맞히면 10, 틀려도 답하면 3, 복습함에서 다시 맞히면 5, 실험실 목표 10, 보스 별 1개에 20
      </p>
      <ol className="lvls">
        {LEVELS.map((l, i) => (
          <li key={l.name} className={i < lv.n ? "on" : ""}>
            <b>Lv.{i + 1}</b> {l.name} <span>{l.min} XP</span>
            {i === lv.n - 1 && <em> ← 지금</em>}
          </li>
        ))}
      </ol>

      <h3>내 가방</h3>
      <KitLinks left={reviewKeys(r).length} />

      <h3>
        배지 {got}/{BADGES.length}
      </h3>
      <div className="badges">
        {BADGES.map((b) => {
          const on = hasBadge(b, r);
          return (
            <div key={b.id} className={`badge ${on ? "on" : ""}`} data-badge={b.id}>
              <span className="bi" aria-hidden="true">
                {on ? b.ico : "🔒"}
              </span>
              <b>
                {b.name}
                <span className="sr-only">{on ? " (얻음)" : " (아직)"}</span>
              </b>
              <span>{b.how}</span>
            </div>
          );
        })}
      </div>

      <h3>진도 옮기기</h3>
      <p className="lead">진도는 이 브라우저에만 저장돼요. 기기를 바꿀 때 파일로 저장했다가 불러오세요. 불러오면 지금 기록에 합쳐지고, 지금 기록은 지워지지 않아요. 파일은 서버로 보내지 않아요.</p>
      <div className="row">
        <button className="btn" onClick={save}>
          진도 파일 저장
        </button>
        <button className="btn alt" onClick={() => file.current?.click()}>
          진도 파일 불러오기
        </button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => open(e.currentTarget.files?.[0])} />
      </div>
      <div role="status" aria-live="polite">{msg && <div className={`out ${msg.ok ? "ok" : "no"}`}>{msg.text}</div>}</div>
      <div className="row">
        <button className="btn alt" onClick={() => go("home")}>
          지도로 돌아가기
        </button>
      </div>
    </section>
  );
}
