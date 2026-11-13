import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { compareHref } from "./selection";

// Link to a comparison. The address is built by hand (`?c=a&c=b`), so navigation goes
// through the router's history instead of a typed `search` object.
export function CompareLink({ slugs, className, children }: { slugs: readonly string[]; className?: string; children: ReactNode }) {
  const router = useRouter();
  const href = compareHref(slugs);
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        router.history.push(href);
      }}
    >
      {children}
    </a>
  );
}
