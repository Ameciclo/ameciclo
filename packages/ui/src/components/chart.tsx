import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "../lib/utils"

// Chart wrapper in the shadcn style: a config maps each data key to a label and
// a color, exposed to Recharts as the CSS variable --color-<key>.

export type ChartConfig = Record<string, { label?: React.ReactNode; color?: string }>

type ChartContextProps = { config: ChartConfig }

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a <ChartContainer />")
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/60 [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colors = Object.entries(config).filter(([, item]) => item.color)
  if (colors.length === 0) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {\n${colors
          .map(([key, item]) => `  --color-${key}: ${item.color};`)
          .join("\n")}\n}`,
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type TooltipItem = {
  dataKey?: string | number
  name?: string | number
  value?: number | string | null
  color?: string
}

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  valueFormatter,
}: {
  active?: boolean
  payload?: readonly TooltipItem[]
  label?: React.ReactNode
  className?: string
  // How to print a value, e.g. as a percentage.
  valueFormatter?: (value: number) => string
}) {
  const { config } = useChart()
  const items = (payload ?? []).filter((item) => item.value !== null && item.value !== undefined)
  if (!active || items.length === 0) return null

  return (
    <div
      className={cn(
        "grid min-w-32 gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      <div className="font-medium">{label}</div>
      <div className="grid gap-1">
        {items.map((item) => {
          const key = String(item.dataKey ?? item.name)
          const value = Number(item.value)
          return (
            <div key={key} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{config[key]?.label ?? item.name}</span>
              <span className="ml-auto font-mono font-medium tabular-nums">
                {valueFormatter ? valueFormatter(value) : value.toLocaleString("pt-BR")}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

type LegendItem = { value?: string | number; dataKey?: string | number; color?: string }

function ChartLegendContent({
  payload,
  className,
}: {
  payload?: readonly LegendItem[]
  className?: string
}) {
  const { config } = useChart()
  if (!payload?.length) return null

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-4 pt-3", className)}>
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.value)
        return (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
            {config[key]?.label ?? item.value}
          </div>
        )
      })}
    </div>
  )
}

export { ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent }
