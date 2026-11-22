import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ME, MESSAGEBOARD, POST_MESSAGE } from "../../constants/querys";
import { convertYoutubeIframesToOembed } from "../../utils/imageCompressor";
import IMESafeEditor from "./IMESafeEditor";

function GuestInput({ setWriterName, setPassword }) {
	return (
		<>
			<Input
				type="text"
				className="h-9 w-36 bg-white"
				maxLength={10}
				required
				placeholder="닉네임"
				autoComplete="off"
				onChange={(e) => setWriterName(e.target.value)}
			/>
			<Input
				type="password"
				className="h-9 w-32 bg-white"
				maxLength={4}
				pattern="[0-9]{4,4}"
				required
				placeholder="비밀번호"
				inputMode="numeric"
				autoComplete="new-password"
				onChange={(e) => setPassword(e.target.value)}
			/>
		</>
	);
}

export default function PostMessageForm({ setCurrentPage }) {
	const [writerName, setWriterName] = useState("");
	const [password, setPassword] = useState("");
	const [editor, setEditor] = useState(null);
	const [uploadCount, setUploadCount] = useState(0);
	const { data } = useQuery(ME);
	const [postMessage] = useMutation(POST_MESSAGE, {
		refetchQueries: [{ query: MESSAGEBOARD, variables: { page: 1 } }],
	});

	const handleUploading = useCallback((isUp) => {
		setUploadCount((prev) => (isUp ? prev + 1 : prev - 1));
	}, []);

	const handleEditorReady = useCallback((editorInstance) => {
		setEditor(editorInstance);
	}, []);

	const onSubmit = (e) => {
		e.preventDefault();
		if (!editor) return;

		const rawData = editor.getData();

		if (uploadCount > 0 || rawData.includes('src="blob:')) {
			alert("이미지 업로드가 진행 중입니다. 잠시만 기다려주세요.");
			return;
		}

		const processedData = convertYoutubeIframesToOembed(rawData);
		const regex = /<p>([^/<>]*)<\/p>/g;
		const content = processedData
			.replaceAll("&nbsp;", " ")
			.replaceAll(regex, "$1 ");

		if (!content || content.trim() === "" || content === "<br>") {
			editor.focus();
			return;
		}

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
		editor.setData("");
		editor.focus();
	};

	return (
		<div className="rounded-xl bg-bokk p-3 shadow-xs">
			<form onSubmit={onSubmit} className="flex flex-col gap-2.5">
				<div className="flex flex-wrap items-center gap-2">
					{data?.me ? null : (
						<GuestInput
							setWriterName={setWriterName}
							setPassword={setPassword}
						/>
					)}
					<Button
						type="submit"
						size="sm"
						className="h-9 bg-bokk-dark px-4 text-sm font-semibold text-white hover:bg-[#046eb5]"
						disabled={uploadCount > 0}
					>
						{uploadCount > 0 ? "업로드 중..." : "작성"}
					</Button>
				</div>

				<div className="w-full overflow-hidden rounded-lg border border-solid border-zinc-300 bg-white text-zinc-900 [&_p]:m-0">
					<IMESafeEditor
						placeholder="내용"
						onUploading={handleUploading}
						onReady={handleEditorReady}
					/>
				</div>
			</form>
		</div>
	);
}
