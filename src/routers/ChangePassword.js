import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CHANGE_PASSWORD, ME } from "../constants/querys";

export default function ChangePassword() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [newPassword2, setNewPassword2] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const { data: isLoginData, loading } = useQuery(ME);
	const [changePassword, { data, loading: submitting }] =
		useMutation(CHANGE_PASSWORD);
	const navigate = useNavigate();
	const form = useRef(null);

	useEffect(() => {
		if (data?.changePassword?.success === undefined) {
			return;
		}
		if (data.changePassword.success === false) {
			setErrorMessage("비밀번호를 변경하는데 실패했습니다.");
			form.current?.reset();
			return;
		}
		navigate("/");
	}, [data, navigate]);

	useEffect(() => {
		if (loading === false && isLoginData?.me === null) {
			navigate("/");
		}
	}, [isLoginData, loading, navigate]);

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
		setErrorMessage("");
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
		<div className="flex flex-col">
			<Link to="/" className="mx-auto mb-6 block">
				<img
					src={`${process.env.REACT_APP_BOKK_IMG}/볶음밥_logo.png`}
					alt="볶음밥 로고"
					className="mx-auto block max-w-[220px]"
				/>
			</Link>

			<form className="flex flex-col gap-3.5" ref={form} onSubmit={onSubmit}>
				<div className="flex flex-col gap-1">
					<label
						htmlFor="cpwInput"
						className="text-sm font-semibold text-zinc-700"
					>
						현재 비밀번호
					</label>
					<Input
						type="password"
						id="cpwInput"
						placeholder="현재 비밀번호"
						maxLength={20}
						pattern=".{8,20}"
						required
						autoFocus
						className="h-10"
						onChange={(e) => setCurrentPassword(e.target.value)}
					/>
					<span className="text-xs text-zinc-500">
						현재 비밀번호를 입력하세요.
					</span>
				</div>

				<div className="flex flex-col gap-1">
					<label
						htmlFor="npwInput"
						className="text-sm font-semibold text-zinc-700"
					>
						새로운 비밀번호
					</label>
					<Input
						type="password"
						id="npwInput"
						placeholder="새로운 비밀번호"
						maxLength={20}
						pattern=".{8,20}"
						autoComplete="new-password"
						required
						className="h-10"
						onChange={(e) => setNewPassword(e.target.value)}
					/>
					<span className="text-xs text-zinc-500">
						8~20자만 사용 가능합니다.
					</span>
				</div>

				<div className="flex flex-col gap-1">
					<label
						htmlFor="npw2Input"
						className="text-sm font-semibold text-zinc-700"
					>
						새로운 비밀번호 확인
					</label>
					<Input
						type="password"
						id="npw2Input"
						placeholder="새로운 비밀번호 확인"
						maxLength={20}
						pattern=".{8,20}"
						autoComplete="new-password"
						required
						className="h-10"
						onChange={(e) => setNewPassword2(e.target.value)}
					/>
					<span className="text-xs text-zinc-500">
						새로운 비밀번호를 한번 더 입력하세요.
					</span>
				</div>

				{errorMessage && (
					<div className="rounded-lg border-[1px] border-solid border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
						{errorMessage}
					</div>
				)}

				<Button
					type="submit"
					size="lg"
					className="mt-1 h-11 w-full text-[15px] font-semibold"
					disabled={submitting}
				>
					{submitting ? "변경 중..." : "비밀번호 변경"}
				</Button>
			</form>
		</div>
	);
}
