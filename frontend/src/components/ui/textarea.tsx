import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[14px] border border-[#262626] bg-[#141414] px-3 py-2 text-base text-white transition-colors outline-none placeholder:text-[#666] focus-visible:border-[#CBFF3D]/60 focus-visible:ring-3 focus-visible:ring-[#CBFF3D]/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
