import { useMutation } from "@apollo/client";
import { useState } from "react";
import { useEffect, useRef } from "react";
import styled from "styled-components";
import { TEXT_TO_IMAGE } from "../constants/querys";
import Spinner from "./Spinner";

function KakaoImageAPI() {
	const [text, setText] = useState("");
	const canvasRef = useRef();

	const [ctx, setCtx] = useState();

	const [textToImage, { data, loading }] = useMutation(TEXT_TO_IMAGE, {
		onCompleted: ({ textToImage }) => {
			if (textToImage.image === null) return;

			// https://stackoverflow.com/questions/4773966/drawing-an-image-from-a-data-url-to-a-canvas
			var img = new Image();
			img.src = "data:image/png;base64, " + textToImage.image;
			img.onload = function () {
				ctx.drawImage(img, 0, 0);
			};
		},
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		canvas.width = 1024;
		canvas.height = 1024;
		setCtx(canvas.getContext("2d"));
	}, []);

	const onSubmit = () => {
		textToImage({
			variables: { input: { text } },
		});
	};

	const onSaveClick = () => {
		if (!canvasRef?.current) return;

		const a = document.createElement("a");
		a.href = canvasRef.current.toDataURL();
		a.download = `${text}.png`;
		a.click();
	};

	return (
		<Layout>
			<TitleDiv>
				<Title>Karlo - 이미지 생성</Title>
				{loading && <Spinner size="40px" color="#03166c" width="4px" />}
			</TitleDiv>
			<Form>
				<TextInput
					type="text"
					placeholder="이미지 설명 문장"
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
				<SubmitButton onClick={onSubmit} disabled={loading}>
					제출
				</SubmitButton>
			</Form>
			<div>
				<a href="https://developers.kakao.com/docs/latest/ko/karlo/how-to-use">
					활용 가이드
				</a>
			</div>
			<FeatureDiv>
				<SaveButton disabled={data === undefined} onClick={onSaveClick}>
					이미지 저장
				</SaveButton>
			</FeatureDiv>
			<div>
				<small>사용시 내역이 기록됩니다.</small>
			</div>
			<CanvasDiv>
				<Canvas ref={canvasRef}></Canvas>
			</CanvasDiv>
		</Layout>
	);
}

export default KakaoImageAPI;

const Layout = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
`;

const TitleDiv = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 1rem;
	color: #03166c;
	border-width: 4px 0;
	border-color: #03166c;
	border-style: solid;
`;

const Title = styled.h1`
	border-radius: 1rem;
	padding: 0.5rem 1rem;
	margin: 0;
	font-weight: bold;
`;

const Form = styled.div`
	display: flex;
	justify-content: center;
`;

const TextInput = styled.input`
	flex: 1 1 auto;
	padding: 0.5rem;
	border: 1px solid #ced4da;
	border-right-width: 0;
	border-radius: 0.25rem 0 0 0.25rem;
`;

const SubmitButton = styled.button`
	border: 1px solid #ced4da;
	border-radius: 0 0.25rem 0.25rem 0;
	padding: 0 0.75rem;
	word-break: keep-all;
`;

const FeatureDiv = styled.div`
	display: flex;
`;

const SaveButton = styled.button`
	border: 1px solid #ced4da;
	padding: 0.25rem 0.75rem;
	border-radius: 0.25rem;
`;

const CanvasDiv = styled.div`
	display: flex;
	justify-content: center;
`;

const Canvas = styled.canvas`
	background-color: white;
	max-width: 100%;
	border: 1px solid gainsboro;
`;
