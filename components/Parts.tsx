import { BLOCKS, srcLinks } from "@/lib/content";
import { Html } from "./Html";

// 프로토타입 srcs(): <span class="src">근거 · 링크 · 링크</span>
export function Srcs({ ids }: { ids: string[] }) {
  return <Html className="src" html={`근거 · ${srcLinks(ids)}`} />;
}
// 프로토타입 brick()
export function Brick({ id, label }: { id: string; label?: string }) {
  return (
    <span className="brick" style={{ background: `var(--b-${id})` }}>
      {label || BLOCKS[id].name}
    </span>
  );
}
