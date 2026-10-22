import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "../lib/utils"

function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return <ToggleGroupPrimitive.Root className={cn("flex flex-wrap items-center gap-1", className)} {...props} />
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
