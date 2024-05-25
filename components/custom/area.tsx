import type { ReactNode } from "react"
export default function Area({
	children,
	title,
}: {
	children: ReactNode
	title: string
}) {
	return (
		<div className="">
			<h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-2">
				{title}
			</h2>
			<div className="flex gap-2 items-center">{children}</div>
		</div>
	)
}
