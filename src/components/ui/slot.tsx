import { Children, cloneElement, isValidElement, type ReactElement } from "react";
import { cn } from "@/lib/utils";

/** Minimal Radix-like Slot: merges props/className onto the single child. */
export function Slot({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  const child = Children.only(children);
  if (!isValidElement(child)) return null;
  const el = child as ReactElement<{ className?: string }>;
  return cloneElement(el, {
    ...props,
    ...(el.props as object),
    className: cn(className, el.props.className),
  });
}
