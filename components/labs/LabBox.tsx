// 프로토타입 labBox(): 모든 실험실 공통 틀. 실험실은 실제 서비스가 아닌 시뮬레이션이다.
export function LabBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="lab">
      <div className="lh">
        🧪 실험실 · {title}
        <span>시뮬레이션</span>
      </div>
      <div className="lb">{children}</div>
    </div>
  );
}
