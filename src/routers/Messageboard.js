import { useQuery } from "@apollo/client";
import { useState } from "react";
import Message from "../components/MessageBoard/Message";
import Pagination from "../components/MessageBoard/Pagination";
import PostMessageForm from "../components/MessageBoard/PostMessageForm";
import { MESSAGEBOARD } from "../querys";

export default function MessageBoard() {
	const [currentPage, setCurrentPage] = useState(1);
	const { data, refetch } = useQuery(MESSAGEBOARD, {
		variables: {
			page: currentPage,
		},
	});
	const [usesTag, setUsesTag] = useState(true);
	return (
		<>
			<PostMessageForm setCurrentPage={setCurrentPage} />
			<div className="p-2">
				<button
					className="btn btn-md bgc-bokk-dark"
					onClick={() => refetch()}>
					새로고침
				</button>
				<button
					className="btn btn-md bgc-bokk-dark ms-1"
					onClick={() => setUsesTag(!usesTag)}>
					{usesTag ? "태그 숨기기" : "태그 보기"}
				</button>
				<div id="board_table">
					<div className="message-board">
						<div className="row g-0 table-header">
							<div className="col-md-1 th">글번호</div>
							{usesTag === true ? (
								<div className="col-md-6_5 th">글내용</div>
							) : (
								<div className="col-md-6_5 th">
									글내용 <small>tag off</small>
								</div>
							)}
							<div className="col-md-2 th"></div>
							<div className="col-md-2 th">글쓴이</div>
							<div className="col-md-0_5 th"></div>
						</div>
						{data?.messageboard?.messages?.map(
							({ id, content, time, writer, reply }) => (
								<Message
									key={id}
									id={id}
									content={content}
									time={time}
									writer={writer}
									reply={reply}
									currentPage={currentPage}
									options={{ usesTag }}
								/>
							)
						)}
						<Pagination
							boardPage={currentPage}
							setCurrentPage={setCurrentPage}
							totalCount={data?.messageboard?.totalCount}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
