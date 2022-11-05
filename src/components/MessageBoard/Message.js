import { useQuery } from "@apollo/client";
import { useState } from "react";
import { IS_LOGIN } from "../../querys";
import PostReplyForm from "./PostReplyForm";

function isNeedDeleteButton(writerName, writerType, writerId, userId) {
	if (writerType === "guest" && writerName !== "----") {
		return true;
	}
	if (writerType === "user" && writerId === userId) {
		return true;
	}
	return false;
}

function Content({ usesTag, content }) {
	if (usesTag === true) {
		return <div dangerouslySetInnerHTML={{ __html: content }}></div>;
	}
	return content;
}

function Reply({ content, time, writer, options }) {
	const { data } = useQuery(IS_LOGIN);
	const onClick = (e) => {
		//showBoardDelete${writer["type"] === "user" ? "User" : ""}Modal( {id}, 'reply')
	};
	return (
		<div className="row bd-reply">
			<div className="col-md-0_5 m_hide">┗</div>
			<div className="col-md-7 bd-content breakable">
				<Content usesTag={options?.usesTag} content={content} />
			</div>
			<div className="col-md-2_5 bd-time retime">{time}</div>
			<div className="col-md-1_5 bd-writer">
				{writer?.name}
				{writer?.type === "user" ? (
					<img
						className="m-1"
						src="https://jiokkae.com/볶음밥/img/네모볶음밥32x32.png"
						style={{ width: "16px" }}
					/>
				) : null}
			</div>
			<div className="col-md-0_5 bd-delete">
				{isNeedDeleteButton(
					writer?.name,
					writer?.type,
					writer?.id,
					data?.me?.id
				) === true ? (
					<button
						type="button"
						className="btn-close"
						aria-label="Close"
						onClick={onclick}></button>
				) : null}
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
	options,
	currentPage,
}) {
	const { data } = useQuery(IS_LOGIN);
	const [opensForm, setOpensForm] = useState(false);
	const onClick = () => {
		//"showBoardDelete${writer["type"] === "user" ? "User" : ""}Modal( ${id}, 'message')"
	};
	return (
		<div className="row g-0">
			<div className="col-md-1 bd-number">{id}</div>
			<div
				className="col-md-6_5 bd-content breakable"
				onClick={() => setOpensForm(!opensForm)}>
				<Content usesTag={options?.usesTag} content={content} />
			</div>
			<div className="col-md-2 bd-time retime">{time}</div>
			<div className="col-md-2 me-auto bd-writer breakable">
				{writer.name}
				{writer.type === "user" ? (
					<img
						className="m-1"
						src="https://jiokkae.com/볶음밥/img/네모볶음밥32x32.png"
						style={{ width: "16px" }}
					/>
				) : null}
			</div>
			<div className="col-md-0_5 bd-delete">
				{isNeedDeleteButton(
					writer.name,
					writer.type,
					writer.id,
					data?.me?.id
				) === true ? (
					<button
						type="button"
						className="btn-close"
						aria-label="Close"
						onClick={onClick}></button>
				) : null}
			</div>
			<div className="message-board p-0 m-0 hide_child">
				{opensForm ? (
					<PostReplyForm messageId={id} currentPage={currentPage} />
				) : null}
				{reply?.map(({ id, content, time, writer }) => (
					<Reply
						key={id}
						content={content}
						time={time}
						writer={writer}
						options={options}
					/>
				))}
			</div>
		</div>
	);
}
