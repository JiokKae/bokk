import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import { ME, MESSAGEBOARD, POST_MESSAGE } from "../../constants/querys";

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

async function processAndCompressImage(file, maxDimension = 1920, quality = 0.85) {
	if (!file || !(file instanceof Blob)) {
		throw new Error("유효한 파일이 아닙니다.");
	}

	if (file.type === "image/gif") {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const blob = new Blob([e.target.result], { type: "image/gif" });
				resolve(new File([blob], file.name || "upload.gif", { type: "image/gif" }));
			};
			reader.onerror = () => resolve(file); // 실패 시 원본 파일 업로드로 우회
			reader.readAsArrayBuffer(file);
		});
	}

	// Try createImageBitmap with EXIF orientation auto-rotation (Fixes mobile vertical photo 90deg rotation!)
	try {
		const imgBitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
		let { width, height } = imgBitmap;
		if (width > maxDimension || height > maxDimension) {
			if (width > height) {
				height = Math.round((height * maxDimension) / width);
				width = maxDimension;
			} else {
				width = Math.round((width * maxDimension) / height);
				height = maxDimension;
			}
		}

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext("2d");
		ctx.drawImage(imgBitmap, 0, 0, width, height);
		
		// 모바일 기기에서 연속 업로드 시 메모리 부족(OOM)으로 인한 실패를 방지하기 위해 메모리 즉시 해제
		if (imgBitmap.close) imgBitmap.close();

		return new Promise((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (!blob) return reject("이미지 변환 실패");
					const newFileName = file.name ? file.name.replace(/\.[^/.]+$/, ".jpg") : "upload.jpg";
					resolve(new File([blob], newFileName, { type: "image/jpeg" }));
				},
				"image/jpeg",
				quality
			);
		});
	} catch (e) {
		// Fallback to FileReader if createImageBitmap fails
		return new Promise((resolve, reject) => {
			if (file.type === "image/heic" || file.type === "image/heif") {
				return reject("HEIC(애플 고효율 이미지) 형식은 지원하지 않습니다. 일반 JPG로 변환하여 업로드해주세요.");
			}
			const reader = new FileReader();
			reader.onload = (evt) => {
				const img = new Image();
				img.onload = () => {
					let { width, height } = img;
					if (width > maxDimension || height > maxDimension) {
						if (width > height) {
							height = Math.round((height * maxDimension) / width);
							width = maxDimension;
						} else {
							width = Math.round((width * maxDimension) / height);
							height = maxDimension;
						}
					}
					const canvas = document.createElement("canvas");
					canvas.width = width;
					canvas.height = height;
					const ctx = canvas.getContext("2d");
					ctx.drawImage(img, 0, 0, width, height);
					canvas.toBlob(
						(blob) => {
							if (!blob) return resolve(file); // 압축 실패 시 원본 반환
							const newFileName = file.name ? file.name.replace(/\.[^/.]+$/, ".jpg") : "upload.jpg";
							resolve(new File([blob], newFileName, { type: "image/jpeg" }));
						},
						"image/jpeg",
						quality
					);
				};
				img.onerror = () => resolve(file); // 이미지 객체 로드 실패 시 원본 반환
				img.src = evt.target.result;
			};
			reader.onerror = () => resolve(file); // 브라우저 메모리 부족으로 읽기 실패 시 원본 반환
			reader.readAsDataURL(file);
		});
	}
}

async function uploadImageFile(file) {
	const processedFile = await processAndCompressImage(file, 1080, 0.8);
	const formData = new FormData();
	formData.append("upload", processedFile);

	const uploadEndpoint = `${process.env.REACT_APP_GRAPHQL_SERVER_URL}upload.php`;

	const response = await fetch(uploadEndpoint, {
		method: "POST",
		body: formData,
	});
	const data = await response.json();
	if (data && data.url) {
		return data.url;
	}
	throw new Error(data?.error?.message || "이미지 업로드에 실패했습니다.");
}

function IMESafeEditor({ onReady, placeholder = "내용", onUploading }) {
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
		const url = prompt("웹사이트 주소(URL)를 입력하세요:", "https://");
		if (url && url.trim() !== "") {
			handleCommand("createLink", url.trim());
		}
	};

	const handleAddVideo = () => {
		const url = prompt("유튜브 동영상 주소(URL)를 입력하세요:", "https://www.youtube.com/watch?v=");
		if (!url) return;

		let videoId = "";
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		if (match && match[2].length === 11) {
			videoId = match[2];
		}

		if (videoId) {
			const videoHtml = `<div className="ratio ratio-16x9 my-2"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`;
			document.execCommand("insertHTML", false, videoHtml);
		} else {
			alert("올바른 유튜브 동영상 주소가 아닙니다.");
		}
	};

	const handleImageChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const tempId = "img-upload-" + Date.now();
		const localPreviewUrl = URL.createObjectURL(file);

		const tempImgHtml = `<figure class="image my-2"><img id="${tempId}" src="${localPreviewUrl}" alt="업로드 중..." style="max-width: 100%; height: auto; border-radius: 8px; opacity: 0.5; transition: opacity 0.3s;" /></figure><p><br></p>`;
		
		if (onUploading) onUploading(true);

		if (contentRef.current) {
			contentRef.current.focus();
		}

		let inserted = document.execCommand("insertHTML", false, tempImgHtml);
		if (!inserted && contentRef.current) {
			contentRef.current.insertAdjacentHTML("beforeend", tempImgHtml);
		}

		// 브라우저가 DOM을 업데이트하고 미리보기 이미지를 화면에 그릴(Paint) 수 있도록 충분히 대기합니다.
		await new Promise(resolve => setTimeout(resolve, 100));

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
			alert(typeof err === "string" ? err : err?.message || "이미지 업로드 실패");
			if (contentRef.current) {
				const imgElement = contentRef.current.querySelector(`#${tempId}`);
				if (imgElement) {
					const figure = imgElement.closest('figure');
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
			/>
		</EditorContainer>
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

	const onSubmit = (e) => {
		e.preventDefault();
		if (!editor) return;

		const rawData = editor.getData();

		if (uploadCount > 0 || rawData.includes('src="blob:')) {
			alert("이미지 업로드가 진행 중입니다. 잠시만 기다려주세요.");
			return;
		}

		const regex = /<p>([^/<>]*)<\/p>/g;
		const content = rawData
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
						<button type="submit" className="btn bgc-bokk-dark" disabled={uploadCount > 0}>
							{uploadCount > 0 ? "업로드 중..." : "작성"}
						</button>
					</div>
				</div>
				<CKEditorLayout>
					<IMESafeEditor
						placeholder="내용"
						onUploading={useCallback((isUp) => {
							setUploadCount(prev => isUp ? prev + 1 : prev - 1);
						}, [])}
						onReady={useCallback((editorInstance) => {
							setEditor(editorInstance);
						}, [])}
					/>
				</CKEditorLayout>
			</form>
		</div>
	);
}

const CKEditorLayout = styled.div`
	width: 100%;
	font-size: 1rem;
	font-weight: 400;
	color: #212529;
	background-color: #fff;
	background-clip: padding-box;
	border: 1px solid #ced4da;
	border-radius: 0.375rem;
	overflow: hidden;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	p {
		margin: 0;
	}
`;

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
