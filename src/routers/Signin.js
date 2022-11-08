import { useMutation, useQuery } from "@apollo/client";
import { createRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ME, QUERIES_AFFECTED_BY_SIGN, SIGNIN } from "../querys";

export default function Signin() {
	const [id, setId] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const passwordInput = createRef();

	useQuery(ME, {
		onCompleted: (data) => {
			if (data?.me) navigate("/");
		},
	});
	const [signin, { data }] = useMutation(SIGNIN, {
		onCompleted: (data) => {
			if (data?.signin) {
				navigate(-1);
				return;
			}
			passwordInput.current.focus();
		},
		refetchQueries: QUERIES_AFFECTED_BY_SIGN,
	});

	const onSubmit = (e) => {
		e.preventDefault();
		signin({
			variables: {
				signinId: id,
				password,
			},
		});
	};
	return (
		<>
			<Link to="/">
				<img src="https://jiokkae.com/볶음밥/img/볶음밥_logo.png" />
			</Link>
			<form className="formSign" onSubmit={onSubmit}>
				<div className="form-floating mb-3">
					<input
						type="text"
						className="form-control"
						placeholder="Username"
						required
						maxLength="20"
						pattern="[A-Za-z0-9]{4,20}"
						autoFocus
						onChange={(e) => {
							setId(e.target.value);
						}}
					/>
					<label htmlFor="inputUsername">아이디</label>
				</div>
				<div className="form-floating mb-3">
					<input
						type="password"
						className="form-control"
						placeholder="비밀번호"
						maxLength="20"
						pattern=".{8,20}"
						required
						ref={passwordInput}
						onChange={(e) => {
							setPassword(e.target.value);
						}}
					/>
					<label htmlFor="inputPassword">비밀번호</label>
				</div>
				<div style={{ color: "red" }}>
					{data?.signin === false ? (
						<p>로그인에 실패했습니다.</p>
					) : null}
				</div>
				<input
					type="submit"
					className="btn btn-lg signBtn"
					value="로그인"
				/>
			</form>
			<hr />
			<div className="text-center">
				<Link to="/signup/">
					<p>계정 만들기</p>
				</Link>
			</div>
		</>
	);
}
