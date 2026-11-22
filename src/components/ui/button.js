import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
	{
		variants: {
			variant: {
				default:
					"border-0 bg-bokk text-white shadow-xs hover:bg-bokk-dark",
				destructive:
					"border-0 bg-red-500 text-white shadow-xs hover:bg-red-600",
				outline:
					"border-[1px] border-solid border-zinc-300 bg-white text-zinc-800 shadow-xs hover:bg-bokk-subtle hover:text-bokk-dark hover:border-bokk-border",
				secondary:
					"border-[1px] border-solid border-zinc-200/80 bg-zinc-100 text-zinc-800 shadow-xs hover:bg-zinc-200/80",
				ghost:
					"border-0 bg-transparent text-zinc-900 hover:bg-bokk-subtle hover:text-bokk-dark",
				link: "border-0 bg-transparent text-bokk underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 rounded-md px-3 text-xs",
				lg: "h-10 rounded-md px-6",
				icon: "size-8",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

const Button = React.forwardRef(
	({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				ref={ref}
				data-slot="button"
				type={asChild ? undefined : type}
				className={cn(buttonVariants({ variant, size, className }))}
				{...props}
			/>
		);
	}
);
Button.displayName = "Button";

export { Button, buttonVariants };
