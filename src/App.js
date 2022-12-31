import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./routers/Home";
import GameRecordSearch from "./routers/GameRecordSearch";
import MessageBoard from "./routers/Messageboard";
import Download from "./routers/Download";
import Signin from "./routers/Signin";
import HeaderLayout from "./outlets/HeaderLayout";
import "./App.css";
import ChangePassword from "./routers/ChangePassword";
import SignLayout from "./outlets/SignLayout";
import Signup from "./routers/Signup";
import Playlist from "./routers/manage/Playlist";
import MyWeblink from "./routers/manage/MyWeblink";
import BuiltinWeblink from "./routers/manage/BuiltinWeblink";
import Image from "./routers/Image";

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
			{
				name: "이미지",
				url: "/image/",
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
		<BrowserRouter>
			<Routes>
				<Route element={<HeaderLayout items={ITEMS} searchSelector />}>
					<Route path="/" element={<Home />} />
					<Route
						path="/gameRecordSearch/"
						element={<GameRecordSearch />}
					/>
					<Route path="/messageboard/" element={<MessageBoard />} />
					<Route path="/download/" element={<Download />} />
					<Route path="/image/" element={<Image />} />
				</Route>
				<Route element={<HeaderLayout items={MANAGE_ITEMS} />}>
					<Route path="/manage/" element={<Playlist />} />
					<Route path="/manage/myWeblink/" element={<MyWeblink />} />
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
		</BrowserRouter>
	);
}
