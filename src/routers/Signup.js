import { useMutation } from "@apollo/client";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QUERIES_AFFECTED_BY_SIGN, SIGNUP } from "../constants/querys";
import { BOKK_IMG } from "../constants/urls";

export default function Signup() {
	const [id, setId] = useState("");
	const [password, setPassword] = useState("");
	const [nickname, setNickname] = useState("");
	const [email, setEmail] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const navigate = useNavigate();

	const [signup] = useMutation(SIGNUP, {
		onCompleted: (data) => {
			if (data?.signup.completed) {
				navigate(-1);
				return;
			}
			if (data?.signup.key) {
				setErrorMessage(data?.signup.message);
				document.getElementById(`${data?.signup.key}Input`).focus();
				return;
			}
		},
		refetchQueries: QUERIES_AFFECTED_BY_SIGN,
	});

	const onSubmit = (e) => {
		e.preventDefault();
		signup({
			variables: {
				input: {
					email,
					id,
					nickname,
					password,
				},
			},
		});
	};
	return (
		<>
			<Link to="/">
				<img src={`${BOKK_IMG}/볶음밥_logo.png`} />
			</Link>
			<form className="formSign" onSubmit={onSubmit}>
				<div className="form-floating mb-3">
					<input
						type="text"
						id="idInput"
						className="form-control"
						placeholder="아이디"
						maxLength="20"
						pattern="[A-Za-z0-9]{4,20}"
						required
						autoFocus
						onChange={(e) => setId(e.target.value)}
					/>
					<label htmlFor="idInput">아이디</label>
					<small id="idHelpBlock" className="form-text text-muted">
						4-20자의 영문과 숫자만 사용 가능합니다.
					</small>
				</div>
				<div className="form-floating mb-3">
					<input
						type="password"
						id="passwordInput"
						className="form-control"
						placeholder="비밀번호"
						maxLength="20"
						pattern=".{8,20}"
						required
						autoComplete="new-password"
						onChange={(e) => setPassword(e.target.value)}
					/>
					<label htmlFor="passwordInput">비밀번호</label>
					<small
						id="passwordHelpBlock"
						className="form-text text-muted">
						8-20자만 사용 가능합니다.
					</small>
				</div>
				<div className="form-floating mb-3">
					<input
						type="text"
						id="nicknameInput"
						className="form-control"
						placeholder="닉네임"
						maxLength="10"
						pattern="[A-Za-z0-9ㄱ-힣]{1,10}"
						required
						onChange={(e) => setNickname(e.target.value)}
					/>
					<label htmlFor="nicknameInput">닉네임</label>
					<small
						id="nicknameHelpBlock"
						className="form-text text-muted">
						1~10자의 한글, 영문, 숫자만 사용 가능합니다.
					</small>
				</div>
				<div className="form-floating mb-3">
					<input
						type="email"
						id="emailInput"
						className="form-control"
						placeholder="이메일"
						maxLength="50"
						required
						onChange={(e) => setEmail(e.target.value)}
					/>
					<label htmlFor="emailInput">이메일</label>
				</div>
				<div style={{ color: "red" }}>
					<p>{errorMessage}</p>
				</div>
				<input
					type="submit"
					className="btn btn-lg signBtn bgc-bokk"
					value="계정 만들기"
				/>
			</form>
			<hr />
			<div className="text-center">
				<Link to="/signin/">
					<p>로그인</p>
				</Link>
			</div>
		</>
	);
}
