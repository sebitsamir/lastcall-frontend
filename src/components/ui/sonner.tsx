"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      /*
       * Pill toasts with inverted colors (light on dark theme, dark on light),
       * straight from the design. The tokens are HSL triplets, so wrap them.
       */
      style={
        {
          "--normal-bg": "hsl(var(--foreground))",
          "--normal-text": "hsl(var(--background))",
          "--normal-border": "transparent",
          "--border-radius": "999px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast shadow-lift !px-5 !py-3.5 !text-sm !font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
