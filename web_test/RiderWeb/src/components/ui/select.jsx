import * as React from "react"

const Select = React.forwardRef(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>{children}</div>
))
Select.displayName = "Select"

const SelectGroup = React.forwardRef(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>{children}</div>
))
SelectGroup.displayName = "SelectGroup"

const SelectValue = React.forwardRef(({ className, children, ...props }, ref) => (
    <span ref={ref} className={className} {...props}>{children}</span>
))
SelectValue.displayName = "SelectValue"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
    <button ref={ref} className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>
        {children}
    </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <div ref={ref} className={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 ${className}`} {...props}>
        <div className="p-1">{children}</div>
    </div>
))
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={`py-1.5 pl-8 pr-2 text-sm font-semibold ${className}`} {...props} />
))
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
    <div ref={ref} className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`} {...props}>
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        </span>
        <span className="truncate">{children}</span>
    </div>
))
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={`-mx-1 my-1 h-px bg-muted ${className}`} {...props} />
))
SelectSeparator.displayName = "SelectSeparator"

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
}
