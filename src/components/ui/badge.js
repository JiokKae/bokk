import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center justify-center rounded-md border-[1px] border-solid px-2 py-0.5 text-[11px] font-semibold w-fit whitespace-nowrap shrink-0 transition-colors",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-bokk text-white",
				secondary:
					"border-zinc-200 bg-zinc-100 text-zinc-700",
				subtle:
					"border-bokk-border bg-bokk-subtle text-bokk-dark",
				destructive:
					"border-transparent bg-red-500 text-white",
				outline:
					"border-zinc-200 bg-white text-zinc-900",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

function Badge({ className, variant, ...props }) {
	return (
		<span
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
