import type { ReactNode } from "react";
import "./style.scss";

type TextType = "title" | "subtitle" | "small" | "text";

interface TextProps {
  type?: TextType;
  text?: ReactNode;
  customClass?: string;
  title?: string;
}

function Text({
  type = "text",
  text = "",
  customClass = "",
  title,
}: TextProps) {
  const Component =
    type === "title"
      ? "h1"
      : type === "subtitle"
      ? "p"
      : type === "small"
      ? "small"
      : "span";

  return (
    <Component
      className={`vm-ifx-${type} ${customClass}`.trim()}
      title={title}
    >
      {text}
    </Component>
  );
}

export default Text;