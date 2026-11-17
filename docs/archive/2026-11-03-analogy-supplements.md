# 승인용 초안 — 비유 5곳 '실제로는' 보충 (기획안 5장 규칙 4)

작성 2026-11-03. 모든 보충 문장은 아래 원문 구절(2026-11-03 내려받은 공식 문서)에서만 나온 내용으로 썼다. 승인 전에는 콘텐츠에 넣지 않는다.

| # | 위치 | 기존 비유 | 추가할 문장 (초안) | 근거 (출처 id · 원문 인용) |
|---|---|---|---|---|
| 1 | blocks/ui 설명 1 (lead 뒤) | "'설계도를 받아서 내 기기가 직접 그리는 것'이에요." | **실제로는** 서버가 완성된 HTML을 만들어 보내는 방식도 있어요. 어느 쪽이든 받은 파일을 화면으로 그리는 건 내 기기의 브라우저예요. | mdnserver: "pulled out of a database stored on a server and sent to the client to be displayed via some code (e.g., HTML and JavaScript)" / mdn: "When an HTML page is returned, it is rendered by the web browser." |
| 2 | blocks/db 설명 1 (표 아래) | 엑셀 표 비유 | **실제로는** Supabase 문서도 표를 엑셀 시트에 비유해요. 다만 데이터베이스 표는 열마다 자료형이 정해져 있고, 표끼리 서로 연결해서 써요. | sbtables: "Tables are similar to Excel spreadsheets. They contain columns and rows." / "link it to other tables" / "Reference lists the column data types that Postgres supports." |
| 3 | blocks/key 설명 3 (".env = 비밀 메모장") | 비밀 메모장 | **실제로는** .env 파일에 특별한 잠금 장치가 있는 건 아니에요. Next.js 기본 템플릿이 .env를 .gitignore에 넣어 저장소에 올라가지 않게 할 뿐이에요. | nextenv: "The default create-next-app template ensures all .env files are added to your .gitignore. You almost never want to commit these files to your repository." ("잠금 장치가 없다"는 원문에 직접 문장은 없음 — 원문이 보호 수단으로 .gitignore만 말한다는 데서 나온 표현. **이 문구는 빼도 됨**) |
| 4 | blocks/always 설명 2 ("VM = 빌린 '내 전용 컴퓨터'") | 내 전용 컴퓨터 | **실제로는** 물리 컴퓨터 한 대를 통째로 받는 게 아니라 AWS 클라우드 안에 만들어진 가상 서버예요. 필요할 때 늘리고 줄일 수 있어요. | ec2: "An EC2 instance is a virtual server in the AWS Cloud." / "add capacity (scale up)… reduce capacity (scale down) again." |
| 5 | blocks/repo 맞혀보기 해설 ("게임의 세이브 포인트와 같아요") | 세이브 포인트 | **실제로는** 커밋은 그 시점 파일 전체의 모습을 '스냅샷'으로 저장해 두는 거예요. | gitwhat: "every time you commit, or save the state of your project, Git basically takes a picture of what all your files look like at that moment and stores a reference to that snapshot." |

## 넣는 방식
- 1~4는 해당 설명 단락 body 끝에 `<p class='lead'>실제로는 …</p>`로 추가하고, 그 단락의 sources에 근거 출처를 추가한다 (1: mdnserver, 2: 이미 sbtables, 3: 이미 nextenv, 4: 이미 ec2).
- 5는 맞혀보기 해설(reveal)에 추가한다. reveal에는 출처 칸이 없으므로, 근거는 같은 블록 설명 2의 출처(gitwhat)로 이미 연결돼 있다.
- 검증: verify-port INTENDED_CHANGES 등록, parity INTENDED_TEXT 치환, 빌드·동등성 검사 후 PR.

## 결정 요청
- 3번 문장에서 "특별한 잠금 장치가 있는 건 아니에요" 부분을 **뺄지** (원문 직접 근거 없음). 추천: 뺀다 → "실제로는 Next.js 기본 템플릿이 .env를 .gitignore에 넣어 저장소에 올라가지 않게 하는 것이 보호의 전부예요."
