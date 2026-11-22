import { useQuery } from "@apollo/client";
import { useState } from "react";
import { ME } from "../../constants/querys";
import DeleteMessageModal from "./DeleteMessageModal";
import Content from "./Message/Content";
import Likes from "./Message/Likes";
import Writer from "./Message/Writer";
import PostReplyForm from "./PostReplyForm";

function Delete({
	writerName,
	writerType,
	writerId,
	userId,
	messageId,
	messageType,
	currentPage,
}) {
	const needsDeleteButton =
		(writerType === "guest" && writerName !== "----") ||
		(writerType === "user" && writerId === userId);

	if (!needsDeleteButton) return null;

	return (
		<DeleteMessageModal
			messageId={messageId}
			messageType={messageType}
			writerType={writerType}
			currentPage={currentPage}
		/>
	);
}

function Reply({ id, content, time, writer, currentPage }) {
	const { data } = useQuery(ME);
	return (
		<div className="grid grid-cols-1 gap-2 rounded-lg border border-solid border-zinc-200 bg-zinc-50 px-3 py-2.5 md:grid-cols-[28px_minmax(0,1fr)_120px_130px_36px] md:items-start md:gap-2">
			<div className="hidden pt-0.5 text-center text-xs text-zinc-400 md:block">
				┗
			</div>
			<div className="min-w-0 break-words text-sm text-zinc-800">
				<Content content={content} />
			</div>
			<div className="flex items-center justify-between gap-2 text-xs text-zinc-500 md:contents">
				<div className="md:pt-0.5 md:text-center">{time}</div>
				<div className="flex items-center gap-1 text-zinc-700 md:pt-0.5">
					<Writer name={writer?.name} type={writer?.type} />
				</div>
				<div className="flex justify-end md:justify-center">
					<Delete
						messageId={id}
						messageType="reply"
						userId={data?.me?.id}
						writerId={writer?.id}
						writerName={writer?.name}
						writerType={writer?.type}
						currentPage={currentPage}
					/>
				</div>
			</div>
		</div>
	);
}

export default function Message({
	id,
	content,
	time,
	writer,
	reply,
	likes,
	currentPage,
}) {
	const { data } = useQuery(ME);
	const [opensForm, setOpensForm] = useState(false);

	return (
		<div className="bg-white">
			<div className="grid grid-cols-1 gap-2 px-3.5 py-3 md:grid-cols-[68px_minmax(0,1fr)_120px_140px_44px] md:items-start md:gap-0 md:p-0">
				{/* 글번호 */}
				<div className="flex items-center justify-between text-xs text-zinc-400 md:flex md:h-full md:items-start md:justify-center md:bg-zinc-50/80 md:py-3 md:text-sm md:font-bold md:text-zinc-700">
					<span>#{id}</span>
					<div className="flex items-center gap-2 md:hidden">
						<span>{time}</span>
						<span className="flex items-center font-medium text-zinc-700">
							<Writer name={writer?.name} type={writer?.type} />
						</span>
						<Delete
							messageId={id}
							messageType="message"
							userId={data?.me?.id}
							writerId={writer?.id}
							writerName={writer?.name}
							writerType={writer?.type}
							currentPage={currentPage}
						/>
					</div>
				</div>

				{/* 글내용 + 좋아요 */}
				<div className="flex min-w-0 flex-col gap-2 break-words text-sm text-zinc-900 md:px-3.5 md:py-3">
					<div className="cursor-pointer">
						<Content
							content={content}
							onClick={() => setOpensForm(!opensForm)}
						/>
					</div>
					<div>
						<Likes messageId={id} likes={likes} />
					</div>
				</div>

				{/* 데스크톱 작성일 */}
				<div className="hidden py-3 text-center text-xs text-zinc-400 md:block">
					{time}
				</div>

				{/* 데스크톱 글쓴이 */}
				<div className="hidden items-center px-2 py-3 text-sm text-zinc-700 md:flex">
					<Writer name={writer?.name} type={writer?.type} />
				</div>

				{/* 데스크톱 삭제 */}
				<div className="hidden items-start justify-center py-2.5 md:flex">
					<Delete
						messageId={id}
						messageType="message"
						userId={data?.me?.id}
						writerId={writer?.id}
						writerName={writer?.name}
						writerType={writer?.type}
						currentPage={currentPage}
					/>
				</div>
			</div>

			{/* 답글 폼 및 답글 목록 */}
			{(opensForm || (reply && reply.length > 0)) && (
				<div className="flex flex-col gap-1.5 px-3.5 pb-3 md:pr-4 md:pl-16">
					{opensForm ? (
						<PostReplyForm messageId={id} currentPage={currentPage} />
					) : null}
					{reply?.map(({ id, content, time, writer }) => (
						<Reply
							key={id}
							id={id}
							content={content}
							time={time}
							writer={writer}
							currentPage={currentPage}
						/>
					))}
				</div>
			)}
		</div>
	);
}
