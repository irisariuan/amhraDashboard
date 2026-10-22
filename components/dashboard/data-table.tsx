"use client"

import {
	type ColumnDef,
	type ColumnFiltersState,
	type RowData,
	columnFilteringFeature,
	createFilteredRowModel,
	createPaginatedRowModel,
	filterFn_includesString,
	flexRender,
	rowPaginationFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

/**
 * Filtering then pagination. `includesString` is what a string column's
 * `auto` filter resolves to, so the search box keeps substring matching.
 */
export const dataTableFeatures = tableFeatures({
	columnFilteringFeature,
	filteredRowModel: createFilteredRowModel(),
	filterFns: { includesString: filterFn_includesString },
	rowPaginationFeature,
	paginatedRowModel: createPaginatedRowModel(),
})

export type DataTableColumn<TData extends RowData> = ColumnDef<
	typeof dataTableFeatures,
	TData
>

interface DataTableProps<TData extends RowData> {
	columns: DataTableColumn<TData>[]
	data: TData[]
	emptyMessage?: string
}

/** Paginated table with a free-text filter on the `message` column. */
export function DataTable<TData extends RowData>({
	columns,
	data,
	emptyMessage = "No results found.",
}: DataTableProps<TData>) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const table = useTable({
		features: dataTableFeatures,
		data,
		columns,
		onColumnFiltersChange: setColumnFilters,
		state: { columnFilters },
	})

	return (
		<div>
			<div className="flex flex-wrap items-center justify-between gap-3 pb-4">
				<Input
					aria-label="Search logs"
					placeholder="Search messages..."
					value={
						(table.getColumn("message")?.getFilterValue() as string) ??
						""
					}
					onChange={event =>
						table
							.getColumn("message")
							?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
				<p className="text-sm text-zinc-500">{table.getFilteredRowModel().rows.length} entries</p>
			</div>
			<div className="overflow-hidden rounded-lg border border-white/10">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map(header => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef
														.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map(row => (
								<TableRow key={row.id}>
									{row.getAllCells().map(cell => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									{emptyMessage}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end gap-3 pt-4">
				<p className="mr-auto text-xs text-zinc-500">Page {table.state.pagination.pageIndex + 1} of {table.getPageCount() || 1}</p>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	)
}
