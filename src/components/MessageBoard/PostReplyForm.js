import { useMutation, useQuery } from "@apollo/client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ME, MESSAGEBOARD, POST_MESSAGE } from "../../constants/querys";

export default function PostReplyForm({ messageId, currentPage }) {
	const [writerName, setWriterName] = useState("");
	const [password, setPassword] = useState("");
	const contentInput = useRef(null);
	const { data } = useQuery(ME);
	const [postMessage] = useMutation(POST_MESSAGE, {
		refetchQueries: [
			{ query: MESSAGEBOARD, variables: { page: currentPage } },
		],
	});

	const submitReply = (targetMessageId) => {
		const replyContent = contentInput.current
			? contentInput.current.value.trim()
			: "";
		if (replyContent === "") {
			return;
		}
		postMessage({
			variables: {
				input: {
					content: replyContent,
					writerName,
					password,
					messageId: targetMessageId,
				},
			},
		});
		if (contentInput.current) {
			contentInput.current.value = "";
		}
	};

	return (
		<div className="flex flex-col gap-2 rounded-lg border border-solid border-bokk-border bg-bokk-subtle/40 p-2.5">
			<div className="flex flex-wrap items-center gap-2">
				{data?.me ? null : (
					<>
						<Input
							type="text"
							className="h-8 w-32 bg-white text-sm"
							maxLength={10}
							required
							placeholder="닉네임"
							onChange={(e) => setWriterName(e.target.value)}
						/>
						<Input
							type="password"
							className="h-8 w-28 bg-white text-sm"
							maxLength={4}
							pattern="[0-9]{4,4}"
							required
							placeholder="비밀번호"
							autoComplete="new-password"
							onChange={(e) => setPassword(e.target.value)}
						/>
					</>
				)}
				<Button
					type="button"
					size="sm"
					className="h-8 bg-bokk-dark px-3.5 hover:bg-bokk"
					onClick={() => submitReply(messageId)}
				>
					작성
				</Button>
			</div>
			<textarea
				className="min-h-[72px] w-full resize-y rounded-md border border-solid border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:border-bokk focus-visible:ring-2 focus-visible:ring-bokk/30"
				placeholder="답글 내용을 입력하세요"
				ref={contentInput}
			/>
		</div>
	);
}
