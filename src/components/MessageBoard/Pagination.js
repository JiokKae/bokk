function Numbers({ boardPage, totalPage, setCurrentPage }) {
	return Array.from({ length: 7 }, (_, i) => boardPage - 3 + i).map(
		(index) => {
			if (index == boardPage) {
				return (
					<li key={index} className="page-item active">
						<a className="page-link" href="#" tabIndex="-1">
							{index}
						</a>
					</li>
				);
			} else if (index > 0 && index < totalPage) {
				return (
					<li key={index} className="page-item pointer">
						<a
							className="page-link"
							onClick={() => setCurrentPage(index)}>
							{index}
						</a>
					</li>
				);
			}
		}
	);
}

export default function Pagination({ boardPage, totalCount, setCurrentPage }) {
	const totalPage = totalCount / 20 + 1;
	return (
		<nav className="p-4" aria-label="Page navigation">
			<ul className="pagination justify-content-center">
				<li className={`page-item${boardPage > 1 ? "" : " disabled"}`}>
					{boardPage > 1 ? (
						<a
							className="page-link word_keep pointer"
							onClick={() => setCurrentPage(boardPage - 1)}>
							이전
						</a>
					) : (
						<a className="page-link word_keep" tabIndex="-1">
							이전
						</a>
					)}
				</li>
				<Numbers
					boardPage={boardPage}
					totalPage={totalPage}
					setCurrentPage={setCurrentPage}
				/>
				<li
					className={`page-item ${
						boardPage < totalPage - 1 ? "" : "disabled"
					}`}>
					{boardPage < totalPage - 1 ? (
						<a
							className="page-link word_keep pointer"
							onClick={() => setCurrentPage(boardPage + 1)}>
							다음
						</a>
					) : (
						<a
							className="page-link word_keep"
							href="#"
							tabIndex="-1">
							다음
						</a>
					)}
				</li>
			</ul>
		</nav>
	);
}
