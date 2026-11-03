import { AlwaysLab } from "./AlwaysLab";
import { AuthLab } from "./AuthLab";
import { DbLab } from "./DbLab";
import { ExtLab } from "./ExtLab";
import { HostLab } from "./HostLab";
import { KeyLab } from "./KeyLab";
import { RepoLab } from "./RepoLab";
import { ServerLab } from "./ServerLab";
import { UiLab } from "./UiLab";

// 블록 JSON의 lab 값 → 실험실 화면
export const LABS: Record<string, () => React.ReactNode> = {
  ui: UiLab,
  server: ServerLab,
  db: DbLab,
  auth: AuthLab,
  ext: ExtLab,
  key: KeyLab,
  host: HostLab,
  always: AlwaysLab,
  repo: RepoLab,
};
