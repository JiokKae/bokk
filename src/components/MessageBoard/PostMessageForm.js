import { useMutation, useQuery } from "@apollo/client";
import { useRef, useState } from "react";
import { IS_LOGIN, MESSAGEBOARD, POST_MESSAGE } from "../../querys";

function GuestInput({ setWriterName, setPassword }) {
	return (
		<>
			<div className="col-auto">
				<input
					type="text"
					className="form-control mb-2"
					maxLength="10"
					required
					placeholder="닉네임"
					autoComplete="off"
					onChange={(e) => setWriterName(e.target.value)}
				/>
			</div>
			<div className="col-auto">
				<input
					type="password"
					className="form-control mb-2"
					maxLength="4"
					pattern="[0-9]{4,4}"
					required
					placeholder="비밀번호"
					inputMode="numeric"
					autoComplete="new-password"
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
		</>
	);
}

export default function PostMessageForm({ setCurrentPage }) {
	const [content, setContent] = useState("");
	const [writerName, setWriterName] = useState("");
	const [password, setPassword] = useState("");
	const contentInput = useRef();
	const { data } = useQuery(IS_LOGIN);
	const [postMessage] = useMutation(POST_MESSAGE, {
		refetchQueries: [{ query: MESSAGEBOARD, variables: { page: 1 } }],
	});
	const onSubmit = (e) => {
		e.preventDefault();
		postMessage({
			variables: {
				input: {
					content,
					writerName,
					password,
				},
			},
		});
		setCurrentPage(1);
		contentInput.current.value = "";
		contentInput.current.focus();
	};
	return (
		<div className="bgc-bokk p-2" style={{ borderRadius: "5px" }}>
			<form onSubmit={onSubmit}>
				<div className="row">
					{data?.me ? null : (
						<GuestInput
							setWriterName={setWriterName}
							setPassword={setPassword}
						/>
					)}
					<div className="col-auto">
						<button type="submit" className="btn bgc-bokk-dark">
							작성
						</button>
					</div>
				</div>
				<textarea
					ref={contentInput}
					className="form-control"
					placeholder="내용"
					onChange={(e) => {
						setContent(e.target.value.trim());
					}}
					required></textarea>
			</form>
		</div>
	);
}
