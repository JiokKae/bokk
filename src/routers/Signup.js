import { useMutation } from "@apollo/client";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QUERIES_AFFECTED_BY_SIGN, SIGNUP } from "../constants/querys";

export default function Signup() {
	const [id, setId] = useState("");
	const [password, setPassword] = useState("");
	const [nickname, setNickname] = useState("");
	const [email, setEmail] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const navigate = useNavigate();

	const [signup, { loading }] = useMutation(SIGNUP, {
		onCompleted: (data) => {
			if (data?.signup.completed) {
				navigate(-1);
				return;
			}
			if (data?.signup.key) {
				setErrorMessage(data?.signup.message);
				document.getElementById(`${data?.signup.key}Input`)?.focus();
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
		<div className="flex flex-col">
			<Link to="/" className="mx-auto mb-6 block">
				<img
					src={`${process.env.REACT_APP_BOKK_IMG}/볶음밥_logo.png`}
					alt="볶음밥 로고"
					className="mx-auto block max-w-[220px]"
				/>
			</Link>

			<form className="flex flex-col gap-3.5" onSubmit={onSubmit}>
				<div className="flex flex-col gap-1">
					<label
						htmlFor="idInput"
						className="text-sm font-semibold text-zinc-700"
					>
						아이디
					</label>
					<Input
						type="text"
						id="idInput"
						placeholder="아이디"
						maxLength={20}
						pattern="[A-Za-z0-9]{4,20}"
						required
						autoFocus
						className="h-10"
						onChange={(e) => setId(e.target.value)}
					/>
					<span id="idHelpBlock" className="text-xs text-zinc-500">
						4-20자의 영문과 숫자만 사용 가능합니다.
					</span>
				</div>

				<div className="flex flex-col gap-1">
					<label
						htmlFor="passwordInput"
						className="text-sm font-semibold text-zinc-700"
					>
						비밀번호
					</label>
					<Input
						type="password"
						id="passwordInput"
						placeholder="비밀번호"
						maxLength={20}
						pattern=".{8,20}"
						required
						autoComplete="new-password"
						className="h-10"
						onChange={(e) => setPassword(e.target.value)}
					/>
					<span id="passwordHelpBlock" className="text-xs text-zinc-500">
						8-20자만 사용 가능합니다.
					</span>
				</div>

				<div className="flex flex-col gap-1">
					<label
						htmlFor="nicknameInput"
						className="text-sm font-semibold text-zinc-700"
					>
						닉네임
					</label>
					<Input
						type="text"
						id="nicknameInput"
						placeholder="닉네임"
						maxLength={10}
						pattern="[A-Za-z0-9ㄱ-힣]{1,10}"
						required
						className="h-10"
						onChange={(e) => setNickname(e.target.value)}
					/>
					<span id="nicknameHelpBlock" className="text-xs text-zinc-500">
						1~10자의 한글, 영문, 숫자만 사용 가능합니다.
					</span>
				</div>

				<div className="flex flex-col gap-1">
					<label
						htmlFor="emailInput"
						className="text-sm font-semibold text-zinc-700"
					>
						이메일
					</label>
					<Input
						type="email"
						id="emailInput"
						placeholder="이메일"
						maxLength={50}
						required
						className="h-10"
						onChange={(e) => setEmail(e.target.value)}
					/>
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
					disabled={loading}
				>
					{loading ? "생성 중..." : "계정 만들기"}
				</Button>
			</form>

			<div className="my-5 border-0 border-t border-solid border-zinc-200" />

			<div className="text-center text-sm text-zinc-600">
				이미 계정이 있으신가요?{" "}
				<Link
					to="/signin/"
					className="font-semibold text-bokk-dark no-underline hover:underline"
				>
					로그인
				</Link>
			</div>
		</div>
	);
}
