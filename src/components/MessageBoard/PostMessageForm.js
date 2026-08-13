import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { ME, MESSAGEBOARD, POST_MESSAGE } from "../../constants/querys";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import InlineEditor from "@ckeditor/ckeditor5-build-inline";
import styled from "styled-components";

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
function processAndCompressImage(file, maxDimension = 1920, quality = 0.85) {
	return new Promise((resolve, reject) => {
		if (!file || !(file instanceof Blob)) {
			return reject("유효한 파일이 아닙니다.");
		}

		if (file.type === "image/gif") {
			const reader = new FileReader();
			reader.onload = (e) => {
				const blob = new Blob([e.target.result], { type: "image/gif" });
				resolve(
					new File([blob], file.name || "upload.gif", {
						type: "image/gif",
					})
				);
			};
			reader.onerror = () => {
				reject("모바일 접근 권한 문제로 이미지를 읽지 못했습니다. 다른 이미지를 선택하거나 다시 시도해 주세요.");
			};
			reader.readAsArrayBuffer(file);
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				try {
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
							if (!blob) {
								return reject("이미지 변환에 실패했습니다.");
							}
							const newFileName = file.name
								? file.name.replace(/\.[^/.]+$/, ".jpg")
								: "upload.jpg";
							const newFile = new File([blob], newFileName, {
								type: "image/jpeg",
							});
							resolve(newFile);
						},
						"image/jpeg",
						quality
					);
				} catch (err) {
					reject("이미지 처리 중 오류가 발생했습니다.");
				}
			};
			img.onerror = () => {
				reject("이미지를 로드할 수 없습니다.");
			};
			img.src = e.target.result;
		};
		reader.onerror = () => {
			reject("모바일 접근 권한 문제로 이미지를 읽지 못했습니다. 다른 이미지를 선택하거나 다시 시도해 주세요.");
		};
		reader.readAsDataURL(file);
	});
}

class MyUploadAdapter {
	constructor(loader) {
		this.loader = loader;
	}

	upload() {
		return this.loader.file
			.then((file) => processAndCompressImage(file))
			.then(
				(processedFile) =>
					new Promise((resolve, reject) => {
						try {
							this._initRequest();
							this._initListeners(resolve, reject, processedFile);
							this._sendRequest(processedFile);
						} catch (err) {
							reject(err?.message || "파일을 읽을 수 없습니다.");
						}
					})
			)
			.catch((err) => {
				const message =
					typeof err === "string"
						? err
						: err?.message ||
						  (err?.name === "NotReadableError"
								? "모바일 접근 권한 문제로 이미지를 읽지 못했습니다. 다른 이미지를 선택하거나 다시 시도해 주세요."
								: "파일 업로드 중 오류가 발생했습니다.");
				return Promise.reject(message);
			});
	}

	abort() {
		if (this.xhr) {
			this.xhr.abort();
		}
	}

	_initRequest() {
		const xhr = (this.xhr = new XMLHttpRequest());
		xhr.open(
			"POST",
			`${process.env.REACT_APP_GRAPHQL_SERVER_URL}upload.php`,
			true
		);
		xhr.withCredentials = true;
		xhr.responseType = "json";
	}

	_initListeners(resolve, reject, file) {
		const xhr = this.xhr;
		const loader = this.loader;
		const genericErrorText = `Couldn't upload file: ${file.name}.`;

		xhr.addEventListener("error", () => reject(genericErrorText));
		xhr.addEventListener("abort", () => reject());
		xhr.addEventListener("load", () => {
			const response = xhr.response;

			if (!response || response.error) {
				return reject(
					response && response.error
						? response.error.message
						: genericErrorText
				);
			}

			resolve({
				default: response.url,
			});
		});

		if (xhr.upload) {
			xhr.upload.addEventListener("progress", (evt) => {
				if (evt.lengthComputable) {
					loader.uploadTotal = evt.total;
					loader.uploaded = evt.loaded;
				}
			});
		}
	}

	_sendRequest(file) {
		const data = new FormData();
		data.append("upload", file);
		this.xhr.send(data);
	}
}

function MyCustomUploadAdapterPlugin(editor) {
	editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
		return new MyUploadAdapter(loader);
	};
}

export default function PostMessageForm({ setCurrentPage }) {
	const [writerName, setWriterName] = useState("");
	const [password, setPassword] = useState("");
	const [editor, setEditor] = useState(null);
	const { data } = useQuery(ME);
	const [postMessage] = useMutation(POST_MESSAGE, {
		refetchQueries: [{ query: MESSAGEBOARD, variables: { page: 1 } }],
	});
	const onSubmit = (e) => {
		e.preventDefault();
		if (!editor) return;

		const rawData = editor.getData();
		const regex = /<p>([^/<>]*)<\/p>/g;
		const content = rawData
			.replaceAll("&nbsp;", " ")
			.replaceAll(regex, "$1 ");

		if (!content || content.trim() === "") {
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
						<button type="submit" className="btn bgc-bokk-dark">
							작성
						</button>
					</div>
				</div>
				<CKEditorLayout>
					<CKEditor
						editor={InlineEditor}
						config={{
							language: "ko",
							toolbar: [
								"bold",
								"|",
								"link",
								"imageUpload",
								"mediaEmbed",
								"|",
								"undo",
								"redo",
							],
							placeholder: "내용",
							extraPlugins: [MyCustomUploadAdapterPlugin],
						}}
						onReady={(editor) => {
							setEditor(editor);
						}}
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
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	p {
		margin: 0;
	}
`;
