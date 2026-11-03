// 콘텐츠 문장에는 <b>, <code>, 표 같은 HTML이 들어 있어서 그대로 넣어 그린다.
// 콘텐츠는 저장소 안의 JSON(사람이 검수한 고정 문장)만 쓰고, 사용자 입력은 절대 넣지 않는다.
import type { JSX } from "react";

type Props = { as?: keyof JSX.IntrinsicElements; html: string; disabled?: boolean } & Omit<React.HTMLAttributes<HTMLElement>, "dangerouslySetInnerHTML" | "children">;
export function Html({ as = "span", html, ...rest }: Props) {
  const Tag = as as React.ElementType;
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}
