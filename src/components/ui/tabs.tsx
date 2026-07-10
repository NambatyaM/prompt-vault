"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  defaultValue: string
  children: React.ReactNode
  className?: string
}

interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | null>(null)

const Tabs = ({ defaultValue, children, className }: TabsProps) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue)
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800", className)}>
      {children}
    </div>
  )
}

const TabsTrigger = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs")

  return (
    <button
      onClick={() => ctx.setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        ctx.activeTab === value
          ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
        className,
      )}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("TabsContent must be used within Tabs")

  if (ctx.activeTab !== value) return null

  return <div className={cn("mt-2", className)}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
