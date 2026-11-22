import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./routers/Home";
import HeaderLayout from "./outlets/HeaderLayout";
import SignLayout from "./outlets/SignLayout";
import "./App.css";

const GameRecordSearch = lazy(() => import("./routers/GameRecordSearch"));
const MessageBoard = lazy(() => import("./routers/Messageboard"));
const Download = lazy(() => import("./routers/Download"));
const Signin = lazy(() => import("./routers/Signin"));
const Signup = lazy(() => import("./routers/Signup"));
const ChangePassword = lazy(() => import("./routers/ChangePassword"));
const Playlist = lazy(() => import("./routers/manage/Playlist"));
const MyWeblink = lazy(() => import("./routers/manage/MyWeblink"));
const BuiltinWeblink = lazy(() => import("./routers/manage/BuiltinWeblink"));

const RouteFallback = (
	<div className="p-4 text-center text-muted">로딩 중...</div>
);

export default function App() {
	const ITEMS = {
		nav: [
			{ name: "웹 링크", url: "/" },
			{ name: "전적 검색", url: "/gameRecordSearch/" },
			{ name: "게시판", url: "/messageboard/" },
			{
				name: "다운로드",
				url: "/download/",
				options: { userOnly: true },
			},
		],
		menu: [
			{ name: "관리", url: "/manage/" },
			{ name: "비밀번호 변경", url: "/changePassword/" },
		],
	};
	const MANAGE_ITEMS = {
		nav: [
			{ name: "재생 목록", url: "/manage/" },
			{ name: "내 웹링크", url: "/manage/myWeblink/" },
			{ name: "볶음밥 웹링크", url: "/manage/builtinWeblink/" },
		],
		menu: [{ name: "비밀번호 변경", url: "/changePassword/" }],
	};
	return (
		<BrowserRouter
			future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
			<Suspense fallback={RouteFallback}>
				<Routes>
					<Route
						element={<HeaderLayout items={ITEMS} searchSelector />}>
						<Route path="/" element={<Home />} />
						<Route
							path="/gameRecordSearch/"
							element={<GameRecordSearch />}
						/>
						<Route
							path="/messageboard/"
							element={<MessageBoard />}
						/>
						<Route path="/download/" element={<Download />} />
					</Route>
					<Route element={<HeaderLayout items={MANAGE_ITEMS} />}>
						<Route path="/manage/" element={<Playlist />} />
						<Route
							path="/manage/myWeblink/"
							element={<MyWeblink />}
						/>
						<Route
							path="/manage/builtinWeblink/"
							element={<BuiltinWeblink />}
						/>
					</Route>
					<Route element={<SignLayout />}>
						<Route path="/signin/" element={<Signin />} />
						<Route path="/signup/" element={<Signup />} />
						<Route
							path="/changePassword/"
							element={<ChangePassword />}
						/>
					</Route>
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}
