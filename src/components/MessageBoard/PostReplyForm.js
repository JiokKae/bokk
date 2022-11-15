import { useMutation, useQuery } from "@apollo/client";
import { useRef, useState } from "react";
import { ME, MESSAGEBOARD, POST_MESSAGE } from "../../constants/querys";

export default function PostReplyForm({ messageId, currentPage }) {
	const [writerName, setWriterName] = useState("");
	const [password, setPassword] = useState("");
	const [content, setContent] = useState("");
	const contentInput = useRef();
	const { data } = useQuery(ME);
	const [postMessage] = useMutation(POST_MESSAGE, {
		refetchQueries: [
			{ query: MESSAGEBOARD, variables: { page: currentPage } },
		],
	});
	const submitReply = (messageId) => {
		if (content === "") {
			return;
		}
		postMessage({
			variables: {
				input: {
					content,
					writerName,
					password,
					messageId,
				},
			},
		});
		contentInput.current.value = "";
	};
	return (
		<div className="bd-reply mt-2">
			<div className="row g-0">
				{data?.me ? null : (
					<>
						<div className="col-4">
							<input
								type="text"
								className="form-control"
								maxLength="10"
								required
								placeholder="닉네임"
								onChange={(e) => setWriterName(e.target.value)}
							/>
						</div>
						<div className="col-4">
							<input
								type="password"
								className="form-control"
								maxLength="4"
								pattern="[0-9]{4,4}"
								required
								placeholder="비밀번호"
								autoComplete="new-password"
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</>
				)}
				<div className="col-auto">
					<button
						type="button"
						className="btn bgc-bokk-dark"
						onClick={() => submitReply(messageId)}>
						작성
					</button>
				</div>
			</div>
			<div className="row g-0">
				<div className="col">
					<textarea
						className="form-control"
						placeholder="내용"
						ref={contentInput}
						onChange={(e) =>
							setContent(e.target.value.trim())
						}></textarea>
				</div>
			</div>
		</div>
	);
}
