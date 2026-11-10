// 브라우저에서 만든 파일을 내려받게 한다. 서버로 보내지 않는다.
// 일부 브라우저는 문서에 붙은 링크만 내려받고, 주소를 바로 지우면 실패할 수 있어 잠시 뒤에 정리한다
// 오늘 날짜(이 기기의 시간 기준) YYYY-MM-DD
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function saveBlob(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
}
