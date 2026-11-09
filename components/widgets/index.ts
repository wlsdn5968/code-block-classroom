import { DiskFill } from "./DiskFill";
import { MemorySim } from "./MemorySim";
import { NPlusOneSim } from "./NPlusOneSim";
import { NullTotal } from "./NullTotal";
import { RateLimit } from "./RateLimit";

// 챕터 레슨 JSON의 sections[].widget 값 → 숫자를 직접 움직여 보는 화면 부품
export const WIDGETS: Record<string, () => React.ReactNode> = {
  "memory-sim": MemorySim,
  "nplus1-sim": NPlusOneSim,
  "disk-fill": DiskFill,
  "null-total": NullTotal,
  "rate-limit": RateLimit,
};
