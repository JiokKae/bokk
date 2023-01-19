import styled from "styled-components";

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
			return (
				<li
					key={index}
					className={`page-item ${index === boardPage && "active"}`}>
					<button
						className="page-link"
						onClick={() => numberButtonOnClick(index)}>
						{index}
					</button>
				</li>
			);
		}
	);
}

export default function Pagination({ boardPage, totalCount, setCurrentPage }) {
	const totalPage = totalCount / 20 + 1;
	const prevButtonOnClick = () => {
		if (boardPage > 1) {
			setCurrentPage(boardPage - 1);
		}
	};
	const nextButtonOnClick = () => {
		if (boardPage < totalPage - 1) {
			setCurrentPage(boardPage + 1);
		}
	};
	return (
		<nav className="p-4" aria-label="Page navigation">
			<ul className="pagination justify-content-center">
				<PreviousButtonLI
					className={`page-item ${boardPage > 1 || "disabled"}`}>
					<button className="page-link" onClick={prevButtonOnClick}>
						이전
					</button>
				</PreviousButtonLI>
				<Numbers
					boardPage={boardPage}
					totalPage={totalPage}
					setCurrentPage={setCurrentPage}
				/>
				<NextButtonLI
					className={`page-item ${
						boardPage < totalPage - 1 || "disabled"
					}`}>
					<button className="page-link" onClick={nextButtonOnClick}>
						다음
					</button>
				</NextButtonLI>
			</ul>
		</nav>
	);
}

const PreviousButtonLI = styled.li`
	word-break: keep-all;
`;

const NextButtonLI = styled.li`
	word-break: keep-all;
`;
