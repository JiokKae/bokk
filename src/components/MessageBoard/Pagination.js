import { cn } from "@/lib/utils";

function Numbers({ boardPage, totalPage, setCurrentPage }) {
	const numberButtonOnClick = (index) => {
		if (index === boardPage) {
			return;
		}
		setCurrentPage(index);
	};

	return Array.from({ length: 7 }, (_, i) => boardPage - 3 + i).map(
		(index) => {
			if (index < 1 || index >= totalPage) {
				return null;
			}
			const isActive = index === boardPage;
			return (
				<li key={index}>
					<button
						type="button"
						onClick={() => numberButtonOnClick(index)}
						className={cn(
							"inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg border border-solid px-2.5 text-sm font-medium transition-colors",
							isActive
								? "border-bokk bg-bokk font-semibold text-white"
								: "border-zinc-200 bg-white text-zinc-700 hover:border-bokk-border hover:bg-bokk-subtle hover:text-bokk-dark"
						)}
					>
						{index}
					</button>
				</li>
			);
		}
	);
}

export default function Pagination({ boardPage, totalCount, setCurrentPage }) {
	const totalPage = (totalCount || 0) / 20 + 1;
	const hasPrev = boardPage > 1;
	const hasNext = boardPage < totalPage - 1;

	return (
		<nav className="py-3" aria-label="Page navigation">
			<ul className="m-0 flex list-none flex-wrap items-center justify-center gap-1.5 p-0">
				<li className="keep-all">
					<button
						type="button"
						disabled={!hasPrev}
						onClick={() => hasPrev && setCurrentPage(boardPage - 1)}
						className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-solid border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:border-bokk-border hover:bg-bokk-subtle hover:text-bokk-dark disabled:pointer-events-none disabled:opacity-45"
					>
						이전
					</button>
				</li>
				<Numbers
					boardPage={boardPage}
					totalPage={totalPage}
					setCurrentPage={setCurrentPage}
				/>
				<li className="keep-all">
					<button
						type="button"
						disabled={!hasNext}
						onClick={() => hasNext && setCurrentPage(boardPage + 1)}
						className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-solid border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:border-bokk-border hover:bg-bokk-subtle hover:text-bokk-dark disabled:pointer-events-none disabled:opacity-45"
					>
						다음
					</button>
				</li>
			</ul>
		</nav>
	);
}
