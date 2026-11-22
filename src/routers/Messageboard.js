import { useQuery } from "@apollo/client";
import { useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Message from "../components/MessageBoard/Message";
import Pagination from "../components/MessageBoard/Pagination";
import PostMessageForm from "../components/MessageBoard/PostMessageForm";
import { MESSAGEBOARD } from "../constants/querys";

export default function MessageBoard() {
	const [currentPage, setCurrentPage] = useState(1);
	const topRef = useRef(null);

	const scrollToComponent = () => {
		if (!topRef.current) return;
		const top = Math.max(
			0,
			topRef.current.getBoundingClientRect().top + window.scrollY - 75
		);
		window.scrollTo({ top, behavior: "smooth" });
	};

	const onSetCurrentPage = (page) => {
		setCurrentPage(page);
		scrollToComponent();
	};

	const { data, refetch } = useQuery(MESSAGEBOARD, {
		variables: {
			page: currentPage,
		},
	});

	return (
		<div className="flex flex-col gap-4">
			<div ref={topRef} name="top" />
			<PostMessageForm setCurrentPage={onSetCurrentPage} />

			<div className="flex flex-col gap-2.5">
				<div className="flex items-center justify-between">
					<Button
						size="sm"
						className="gap-1.5 bg-bokk-dark hover:bg-bokk"
						onClick={() => refetch()}
					>
						<RefreshCw className="size-3.5" />
						<span>새로고침</span>
					</Button>
				</div>

				<div
					id="board_table"
					className="overflow-hidden rounded-xl border border-solid border-zinc-200 bg-white shadow-xs"
				>
					{/* 데스크톱 테이블 헤더 */}
					<div className="hidden grid-cols-[68px_minmax(0,1fr)_120px_140px_44px] items-center border-b-2 border-solid border-bokk-dark bg-zinc-100 text-center text-xs font-bold text-zinc-700 md:grid">
						<div className="py-3">글번호</div>
						<div className="py-3">글내용</div>
						<div className="py-3">작성일</div>
						<div className="py-3">글쓴이</div>
						<div className="py-3" />
					</div>

					<div className="divide-y divide-zinc-200">
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
					</div>
				</div>

				<Pagination
					boardPage={currentPage}
					setCurrentPage={onSetCurrentPage}
					totalCount={data?.messageboard?.totalCount}
				/>
			</div>
		</div>
	);
}
