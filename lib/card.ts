// 안전 수칙 카드를 그림(PNG)으로 그린다 (기획서 v2 5장 ①). 브라우저 안에서만 그리고, 어디로도 보내지 않는다.
import type { Run } from "./kit";

const W = 1080;
const PAD = 72;
const BODY = 34; // 본문 글자 크기(px)
const LINE = 54; // 줄 높이
const NUM = 56; // 번호 칸 너비
const GAP = 26; // 수칙 사이 간격
const FONT = '"IBM Plex Sans KR", system-ui, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
const DISPLAY = `"Do Hyeon", ${FONT}`;
const font = (bold: boolean) => `${bold ? 700 : 400} ${BODY}px ${FONT}`;

type Piece = { t: string; b: boolean; x: number };
// 낱말 단위로 줄을 나눈다(한국어는 띄어쓰기에서 줄바꿈). 한 낱말이 줄보다 길면 글자 단위로 끊는다
function layout(ctx: CanvasRenderingContext2D, rs: Run[], maxW: number): Piece[][] {
  const lines: Piece[][] = [[]];
  let x = 0;
  const put = (t: string, b: boolean) => {
    ctx.font = font(b);
    const w = ctx.measureText(t).width;
    if (x + w > maxW && x > 0) {
      lines.push([]);
      x = 0;
      t = t.replace(/^\s+/, "");
      if (!t) return;
    }
    const tw = ctx.measureText(t).width;
    // 낱말이 한 줄보다 길면 글자 단위로 끊는다(한 글자는 더 쪼갤 수 없으니 그대로 둔다)
    if (tw > maxW && [...t].length > 1) {
      for (const ch of t) put(ch, b);
      return;
    }
    lines[lines.length - 1].push({ t, b, x });
    x += tw;
  };
  for (const r of rs) for (const tok of r.t.split(/(?<=\s)/)) put(tok, r.b);
  return lines.filter((l) => l.length);
}

export type CardInput = { title: string; sub: string; rules: Run[][]; footer: string };
export async function drawCard(input: CardInput): Promise<Blob> {
  // 웹 글꼴이 아직 안 왔으면 기다린다(없으면 기기 기본 글꼴로 그린다)
  const all = input.title + input.sub + input.footer + input.rules.flat().map((r) => r.t).join("");
  await Promise.all([document.fonts.load(font(false), all), document.fonts.load(font(true), all), document.fonts.load(`64px ${DISPLAY}`, input.title)]).catch(() => {});

  const probe = document.createElement("canvas").getContext("2d")!;
  const textW = W - PAD * 2 - 48 - NUM;
  const laid = input.rules.map((rs) => layout(probe, rs, textW));
  const head = 230;
  const bodyH = laid.reduce((n, l) => n + l.length * LINE + GAP, 0);
  const H = PAD + head + bodyH + 110 + PAD;

  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#f7f8f4";
  c.fillRect(0, 0, W, H);
  // 카드
  const [cx, cy, cw, chh] = [PAD - 24, PAD - 24, W - (PAD - 24) * 2, H - (PAD - 24) * 2];
  c.fillStyle = "#ffffff";
  c.strokeStyle = "#1f2523";
  c.lineWidth = 5;
  c.beginPath();
  c.roundRect(cx, cy, cw, chh, 24);
  c.fill();
  c.stroke();
  // 머리띠
  c.save();
  c.beginPath();
  c.roundRect(cx, cy, cw, 170, [24, 24, 0, 0]);
  c.clip();
  c.fillStyle = "#ffd23f";
  c.fillRect(cx, cy, cw, 170);
  c.restore();
  c.beginPath();
  c.moveTo(cx, cy + 170);
  c.lineTo(cx + cw, cy + 170);
  c.stroke();
  c.fillStyle = "#1f2523";
  c.textBaseline = "alphabetic";
  c.font = `64px ${DISPLAY}`;
  c.fillText(input.title, PAD + 16, cy + 92);
  c.font = `400 30px ${FONT}`;
  c.fillText(input.sub, PAD + 16, cy + 140);

  let y = PAD + head;
  laid.forEach((lines, i) => {
    c.fillStyle = "#1f2523";
    c.beginPath();
    c.arc(PAD + 16 + 21, y - 12, 21, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#ffffff";
    c.font = `700 24px ${FONT}`;
    c.textAlign = "center";
    c.fillText(String(i + 1), PAD + 16 + 21, y - 4);
    c.textAlign = "left";
    c.fillStyle = "#1f2523";
    for (const line of lines) {
      for (const p of line) {
        c.font = font(p.b);
        c.fillText(p.t, PAD + 16 + NUM + p.x, y);
      }
      y += LINE;
    }
    y += GAP;
  });
  c.fillStyle = "#5f6864";
  c.font = `400 26px ${FONT}`;
  c.fillText(input.footer, PAD + 16, H - PAD - 24);
  return new Promise((ok, no) => cv.toBlob((b) => (b ? ok(b) : no(new Error("그림을 만들지 못했어요"))), "image/png"));
}
