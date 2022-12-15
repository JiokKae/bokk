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
class MyUploadAdapter {
	constructor(loader) {
		this.loader = loader;
	}

	upload() {
		return this.loader.file.then(
			(file) =>
				new Promise((resolve, reject) => {
					this._initRequest();
					this._initListeners(resolve, reject, file);
					this._sendRequest(file);
				})
		);
	}

	abort() {
		if (this.xhr) {
			this.xhr.abort();
		}
	}

	_initRequest() {
		const xhr = (this.xhr = new XMLHttpRequest());
		xhr.open("POST", "http://localhost/api/upload.php", true);
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
	const [content, setContent] = useState("");
	const [writerName, setWriterName] = useState("");
	const [password, setPassword] = useState("");
	const [editor, setEditor] = useState(null);
	const { data } = useQuery(ME);
	const [postMessage] = useMutation(POST_MESSAGE, {
		refetchQueries: [{ query: MESSAGEBOARD, variables: { page: 1 } }],
	});
	const onSubmit = (e) => {
		e.preventDefault();
		if (content === "") {
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
						onChange={(event, editor) => {
							const regex = /<p>([^/<>]*)<\/p>/g;
							setContent(
								editor
									.getData()
									.replaceAll("&nbsp;", "")
									.replaceAll(regex, "$1 ")
							);
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
