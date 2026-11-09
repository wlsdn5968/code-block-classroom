import { MemorySim } from "./MemorySim";

// 챕터 레슨 JSON의 sections[].widget 값 → 숫자를 직접 움직여 보는 화면 부품
export const WIDGETS: Record<string, () => React.ReactNode> = {
  "memory-sim": MemorySim,
};
