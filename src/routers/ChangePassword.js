import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CHANGE_PASSWORD, ME } from "../querys";

export default function ChangePassword() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [newPassword2, setNewPassword2] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const { data: isLoginData, loading } = useQuery(ME);
	const [changePassword, { data }] = useMutation(CHANGE_PASSWORD);
	const navigate = useNavigate();
	const form = useRef();

	useEffect(() => {
		if (data?.changePassword?.success === undefined) {
			return;
		}
		if (data.changePassword.success === false) {
			setErrorMessage("비밀번호를 변경하는데 실패했습니다.");
			form.current.reset();
			return;
		}
		navigate("/");
	}, [data]);

	useEffect(() => {
		if (loading === false && isLoginData?.me === null) {
			navigate("/");
		}
	}, [isLoginData]);

	const onSubmit = (e) => {
		e.preventDefault();
		if (currentPassword === newPassword) {
			setErrorMessage("현재 비밀번호와 새로운 비밀번호가 동일합니다.");
			return;
		}
		if (newPassword !== newPassword2) {
			setErrorMessage("새로운 비밀번호가 일치하지 않습니다.");
			return;
		}
		changePassword({
			variables: {
				input: {
					currentPassword,
					newPassword,
				},
			},
		});
	};
	return (
		<>
			<Link to="/">
				<img src="https://jiokkae.com/볶음밥/img/볶음밥_logo.png" />
			</Link>
			<form className="formSign" ref={form} onSubmit={onSubmit}>
				<div className="form-floating mb-3">
					<input
						type="password"
						id="cpwInput"
						className="form-control"
						placeholder="현재 비밀번호"
						maxLength="20"
						pattern=".{8,20}"
						required
						autoFocus
						onChange={(e) => setCurrentPassword(e.target.value)}
					/>
					<label htmlFor="cpwInput">현재 비밀번호</label>
					<small className="form-text text-muted">
						현재 비밀번호를 입력하세요.
					</small>
				</div>
				<div className="form-floating mb-3">
					<input
						type="password"
						id="npwInput"
						className="form-control"
						placeholder="새로운 비밀번호"
						maxLength="20"
						pattern=".{8,20}"
						autoComplete="new-password"
						required
						onChange={(e) => setNewPassword(e.target.value)}
					/>
					<label htmlFor="npwInput">새로운 비밀번호</label>
					<small className="form-text text-muted">
						8~20자만 사용 가능합니다.
					</small>
				</div>
				<div className="form-floating mb-3">
					<input
						type="password"
						id="npw2Input"
						className="form-control"
						placeholder="새로운 비밀번호 확인"
						maxLength="20"
						pattern=".{8,20}"
						autoComplete="new-password"
						required
						onChange={(e) => setNewPassword2(e.target.value)}
					/>
					<label htmlFor="npw2Input">새로운 비밀번호 확인</label>
					<small className="form-text text-muted">
						새로운 비밀번호를 한번 더 입력하세요.
					</small>
				</div>
				<div style={{ color: "red" }}>{errorMessage}</div>
				<input
					type="submit"
					className="btn btn-lg bgc-bokk signBtn"
					value="비밀번호 변경"
				/>
			</form>
		</>
	);
}
