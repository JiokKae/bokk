import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { uploadImageFile } from "../../utils/imageCompressor";
import { extractYoutubeVideoId } from "../../utils/youtubeUtil";

export default function IMESafeEditor({
	onReady,
	placeholder = "내용",
	onUploading,
}) {
	const contentRef = useRef(null);
	const fileInputRef = useRef(null);
	const [fileKey, setFileKey] = useState(Date.now());

	const handleCommand = (command, value = null) => {
		document.execCommand(command, false, value);
		if (contentRef.current) {
			contentRef.current.focus();
		}
	};

	const handleAddLink = () => {
		const url = prompt(
			"웹사이트 주소(URL)를 입력하세요.\n(예: https://...)",
			""
		);
		if (url && url.trim() !== "") {
			handleCommand("createLink", url.trim());
		}
	};

	const handleAddVideo = () => {
		const url = prompt(
			"유튜브 동영상 주소(URL)를 입력하세요.\n(예: https://www.youtube.com/watch?v=...)",
			""
		);
		if (!url) return;

		const videoId = extractYoutubeVideoId(url);
		if (videoId) {
			const videoHtml = `<div class="ratio ratio-16x9 my-2"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`;

			if (contentRef.current) contentRef.current.focus();

			const success = document.execCommand("insertHTML", false, videoHtml);
			if (!success && contentRef.current) {
				contentRef.current.focus();
				contentRef.current.insertAdjacentHTML("beforeend", videoHtml);
			}
		} else {
			alert("올바른 유튜브 동영상 주소가 아닙니다.");
		}
	};

	const uploadAndInsert = async (file) => {
		if (!file) return;

		const tempId =
			"img-upload-" +
			Date.now() +
			"-" +
			Math.random().toString(36).substring(2, 7);
		const localPreviewUrl = URL.createObjectURL(file);

		const tempImgHtml = `<figure class="image my-2"><img id="${tempId}" src="${localPreviewUrl}" alt="업로드 중..." style="max-width: 100%; height: auto; border-radius: 8px; opacity: 0.5; transition: opacity 0.3s;" /></figure><p><br></p>`;

		if (onUploading) onUploading(true);

		if (contentRef.current) {
			contentRef.current.focus();
		}

		const inserted = document.execCommand("insertHTML", false, tempImgHtml);
		if (!inserted && contentRef.current) {
			contentRef.current.insertAdjacentHTML("beforeend", tempImgHtml);
		}

		// 브라우저가 DOM을 업데이트하고 미리보기 이미지를 화면에 그릴(Paint) 수 있도록 충분히 대기합니다.
		await new Promise((resolve) => setTimeout(resolve, 100));

		try {
			const imageUrl = await uploadImageFile(file);
			if (contentRef.current) {
				const imgElement = contentRef.current.querySelector(`#${tempId}`);
				if (imgElement) {
					imgElement.src = imageUrl;
					imgElement.style.opacity = "1";
					imgElement.alt = "업로드 이미지";
					imgElement.removeAttribute("id");
				} else {
					const imgHtml = `<figure class="image my-2"><img src="${imageUrl}" alt="업로드 이미지" style="max-width: 100%; height: auto; border-radius: 8px;" /></figure><p><br></p>`;
					contentRef.current.insertAdjacentHTML("beforeend", imgHtml);
				}
			}
		} catch (err) {
			alert(
				typeof err === "string" ? err : err?.message || "이미지 업로드 실패"
			);
			if (contentRef.current) {
				const imgElement = contentRef.current.querySelector(`#${tempId}`);
				if (imgElement) {
					const figure = imgElement.closest("figure");
					if (figure) figure.remove();
					else imgElement.remove();
				}
			}
		} finally {
			URL.revokeObjectURL(localPreviewUrl);
			setFileKey(Date.now());
			if (onUploading) onUploading(false);
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			uploadAndInsert(file);
		}
	};

	const handleImageFileTransfer = (e, files) => {
		if (files && files.length > 0) {
			const imageFile = Array.from(files).find((f) =>
				f.type.startsWith("image/")
			);
			if (imageFile) {
				e.preventDefault();
				uploadAndInsert(imageFile);
			}
		}
	};

	useEffect(() => {
		if (onReady && contentRef.current) {
			onReady({
				getData: () => {
					if (!contentRef.current) return "";
					return contentRef.current.innerHTML;
				},
				setData: (html) => {
					if (contentRef.current) {
						contentRef.current.innerHTML = html;
					}
				},
				focus: () => {
					if (contentRef.current) {
						contentRef.current.focus();
					}
				},
			});
		}
	}, [onReady]);

	return (
		<EditorContainer>
			<EditorToolbar>
				<button
					type="button"
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => handleCommand("bold")}
					title="굵게 (Bold)"
				>
					<b>B</b>
				</button>
				<span className="divider" />
				<button
					type="button"
					onMouseDown={(e) => e.preventDefault()}
					onClick={handleAddLink}
					title="링크 삽입"
				>
					🔗
				</button>
				<button
					type="button"
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => fileInputRef.current?.click()}
					title="이미지 업로드"
				>
					🖼️
				</button>
				<button
					type="button"
					onMouseDown={(e) => e.preventDefault()}
					onClick={handleAddVideo}
					title="유튜브 동영상 삽입"
				>
					🎥
				</button>
				<span className="divider" />
				<button
					type="button"
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => handleCommand("undo")}
					title="실행 취소"
				>
					↺
				</button>
				<button
					type="button"
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => handleCommand("redo")}
					title="다시 실행"
				>
					↻
				</button>

				<input
					key={fileKey}
					type="file"
					ref={fileInputRef}
					onChange={handleImageChange}
					accept="image/*"
					style={{ display: "none" }}
				/>
			</EditorToolbar>

			<EditableContent
				ref={contentRef}
				contentEditable
				suppressContentEditableWarning
				placeholder={placeholder}
				onPaste={(e) => handleImageFileTransfer(e, e.clipboardData?.files)}
				onDrop={(e) => handleImageFileTransfer(e, e.dataTransfer?.files)}
			/>
		</EditorContainer>
	);
}

const EditorContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`;

const EditorToolbar = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 6px 10px;
	background-color: #f8f9fa;
	border-bottom: 1px solid #e9ecef;
	user-select: none;

	button {
		border: 1px solid #dee2e6;
		background: #ffffff;
		border-radius: 4px;
		padding: 3px 8px;
		font-size: 13px;
		line-height: 1.2;
		color: #495057;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;

		&:hover {
			background-color: #e9ecef;
			color: #212529;
		}

		&:active {
			background-color: #ced4da;
		}
	}

	.divider {
		width: 1px;
		height: 16px;
		background-color: #dee2e6;
		margin: 0 4px;
	}
`;

const EditableContent = styled.div`
	min-height: 120px;
	padding: 12px;
	outline: none;
	font-size: 1rem;
	line-height: 1.5;
	color: #212529;

	&:empty:before {
		content: attr(placeholder);
		color: #adb5bd;
		cursor: text;
	}
`;
