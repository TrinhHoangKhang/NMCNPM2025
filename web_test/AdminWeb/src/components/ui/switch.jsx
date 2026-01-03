import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, onCheckedChange, checked, ...props }, ref) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        ref={ref}
        className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 bg-slate-200 data-[state=checked]:bg-green-600",
            className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
    >
        <span
            data-state={checked ? "checked" : "unchecked"}
            className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform translate-x-0 data-[state=checked]:translate-x-5"
            )}
        />
    </button>
))
Switch.displayName = "Switch"

export { Switch }
