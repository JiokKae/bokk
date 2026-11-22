import { useQuery } from "@apollo/client";
import { useRef, useState } from "react";
import Message from "../components/MessageBoard/Message";
import Pagination from "../components/MessageBoard/Pagination";
import PostMessageForm from "../components/MessageBoard/PostMessageForm";
import { MESSAGEBOARD } from "../constants/querys";

export default function MessageBoard() {
	const [currentPage, setCurrentPage] = useState(1);
	const topRef = useRef(null);
	const onSetCurrentPage = (page) => {
		setCurrentPage(page);
		scrollToComponent();
	};
	const { data, refetch } = useQuery(MESSAGEBOARD, {
		variables: {
			page: currentPage,
		},
	});
	const scrollToComponent = () => {
		if (!topRef.current) return;
		const top = Math.max(
			0,
			topRef.current.getBoundingClientRect().top + window.scrollY - 75
		);
		window.scrollTo({ top, behavior: "smooth" });
	};
	return (
		<>
			<div ref={topRef} name="top"></div>
			<PostMessageForm setCurrentPage={onSetCurrentPage} />
			<div className="p-2">
				<button
					className="btn btn-md bgc-bokk-dark"
					onClick={() => refetch()}>
					새로고침
				</button>
				<div id="board_table">
					<div className="message-board">
						<div className="row g-0 table-header">
							<div className="col-md-1 th">글번호</div>
							<div className="col-md-6_5 th">글내용</div>
							<div className="col-md-2 th"></div>
							<div className="col-md-2 th">글쓴이</div>
							<div className="col-md-0_5 th"></div>
						</div>
						{data?.messageboard?.messages?.map(
							({ id, content, time, writer, reply, likes }) => (
								<Message
									key={id}
									id={id}
									content={content}
									time={time}
									writer={writer}
									reply={reply}
									likes={likes}
									currentPage={currentPage}
								/>
							)
						)}
						<Pagination
							boardPage={currentPage}
							setCurrentPage={onSetCurrentPage}
							totalCount={data?.messageboard?.totalCount}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
