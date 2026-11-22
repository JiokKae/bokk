import { useMutation, useQuery } from "@apollo/client";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ME, QUERIES_AFFECTED_BY_SIGN, SIGNIN } from "../constants/querys";

export default function Signin() {
	const [id, setId] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const passwordInput = useRef(null);

	useQuery(ME, {
		onCompleted: (data) => {
			if (data?.me) navigate("/");
		},
	});

	const [signin, { data, loading }] = useMutation(SIGNIN, {
		onCompleted: (data) => {
			if (data?.signin) {
				navigate(-1);
				return;
			}
			passwordInput.current?.focus();
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
		<div className="flex flex-col">
			<Link to="/" className="mx-auto mb-6 block">
				<img
					src={`${process.env.REACT_APP_BOKK_IMG}/볶음밥_logo.png`}
					alt="볶음밥 로고"
					className="mx-auto block max-w-[220px]"
				/>
			</Link>

			<form className="flex flex-col gap-3.5" onSubmit={onSubmit}>
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="inputUsername"
						className="text-sm font-semibold text-zinc-700"
					>
						아이디
					</label>
					<Input
						id="inputUsername"
						type="text"
						placeholder="아이디 입력"
						required
						maxLength={20}
						pattern="[A-Za-z0-9]{4,20}"
						autoFocus
						className="h-10"
						onChange={(e) => setId(e.target.value)}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="inputPassword"
						className="text-sm font-semibold text-zinc-700"
					>
						비밀번호
					</label>
					<Input
						id="inputPassword"
						type="password"
						placeholder="비밀번호 입력"
						maxLength={20}
						pattern=".{8,20}"
						required
						ref={passwordInput}
						className="h-10"
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>

				{data?.signin === false && (
					<div className="rounded-lg border-[1px] border-solid border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
						로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.
					</div>
				)}

				<Button
					type="submit"
					size="lg"
					className="mt-1 h-11 w-full text-[15px] font-semibold"
					disabled={loading}
				>
					{loading ? "로그인 중..." : "로그인"}
				</Button>
			</form>

			<div className="my-5 border-0 border-t border-solid border-zinc-200" />

			<div className="text-center text-sm text-zinc-600">
				아직 계정이 없으신가요?{" "}
				<Link
					to="/signup/"
					className="font-semibold text-bokk-dark no-underline hover:underline"
				>
					계정 만들기
				</Link>
			</div>
		</div>
	);
}
