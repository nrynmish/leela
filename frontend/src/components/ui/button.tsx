import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#CBFF3D] text-[#0A0A0A] hover:bg-[#D7FF5E]",
        outline:
          "border-[#303030] bg-[#141414] text-white hover:bg-[#1A1A1A]",
        secondary:
          "bg-[#1A1A1A] text-white hover:bg-[#222222]",
        ghost:
          "bg-transparent text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white",
        destructive:
          "bg-red-500/10 text-red-400 hover:bg-red-500/20",
        link: "text-[#CBFF3D] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-4",
        xs: "h-7 gap-1 rounded-full px-2.5 text-xs",
        sm: "h-8 gap-1.5 rounded-full px-3 text-xs",
        lg: "h-10 gap-2 px-5 text-sm",
        icon: "size-9",
        "icon-xs": "size-7 rounded-full",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
