import { useQuery } from "@apollo/client";
import { useState } from "react";
import styled from "styled-components";
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
	const NeedsDeleteButton = (writerName, writerType, writerId, userId) => {
		if (writerType === "guest" && writerName !== "----") {
			return true;
		}
		if (writerType === "user" && writerId === userId) {
			return true;
		}
		return false;
	};
	return (
		<>
			{NeedsDeleteButton(writerName, writerType, writerId, userId) ? (
				<DeleteMessageModal
					messageId={messageId}
					messageType={messageType}
					writerType={writerType}
					currentPage={currentPage}
				/>
			) : null}
		</>
	);
}

function Reply({ id, content, time, writer, currentPage }) {
	const { data } = useQuery(ME);
	return (
		<div className="row bd-reply">
			<div className="col-md-0_5 m_hide">┗</div>
			<div className="col-md-7 bd-content">
				<Content content={content} />
			</div>
			<div className="col-md-2_5 bd-time retime">{time}</div>
			<div className="col-md-1_5 bd-writer">
				<Writer name={writer?.name} type={writer?.type} />
			</div>
			<div className="col-md-0_5 bd-delete">
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
		<div className="row g-0">
			<NumberLayout>{id}</NumberLayout>
			<div className="col-md-6_5 bd-content">
				<Content
					content={content}
					onClick={() => setOpensForm(!opensForm)}
				/>
				<div>
					<Likes messageId={id} likes={likes} />
				</div>
			</div>
			<div className="col-md-2 bd-time retime">{time}</div>
			<div className="col-md-2 me-auto bd-writer">
				<Writer name={writer?.name} type={writer?.type} />
			</div>
			<div className="col-md-0_5 bd-delete">
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
			<div className="message-board p-0 m-0">
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
		</div>
	);
}

const NumberLayout = styled.div`
	flex: 0 0 auto;
	width: 8.33333333%;
	text-align: center;
	padding: 0;
	font-weight: bold;
	background-color: #f3f6f7;
	@media (max-width: 767px) {
		color: #aaa !important;
		padding: 0.25rem !important;
		font-weight: normal !important;
		background-color: #0000 !important;
		font-size: 0.75rem;
		width: auto;
		position: absolute;
	}
`;
