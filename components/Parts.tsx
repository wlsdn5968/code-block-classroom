import { BLOCKS, SOURCES, srcLinks } from "@/lib/content";
import { Html } from "./Html";

// 프로토타입 srcs(): <span class="src">근거 · 링크 · 링크</span>
// 추가(2026-11-03): 출처가 전부 2차 자료면 '2차 자료' 배지를 붙이고(기획안 5장 규칙 2),
// noSource 항목은 "출처 없음 · 설명/비유"로 표시한다(결정 2).
export function Srcs({ ids, noSource }: { ids: string[]; noSource?: string }) {
  if (noSource) return <span className="src nosrc">출처 없음 · {noSource}</span>;
  const secondaryOnly = ids.length > 0 && ids.every((k) => SOURCES[k].kind === "secondary");
  return <Html className="src" html={`${secondaryOnly ? '<span class="badge2">2차 자료</span> ' : ""}근거 · ${srcLinks(ids)}`} />;
}
// 프로토타입 brick()
export function Brick({ id, label }: { id: string; label?: string }) {
  return (
    <span className="brick" style={{ background: `var(--b-${id})` }}>
      {label || BLOCKS[id].name}
    </span>
  );
}
