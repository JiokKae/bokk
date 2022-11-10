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

export default function App() {
	const ITEMS = {
		nav: [
			{ name: "웹 링크", url: "/" },
			{ name: "전적 검색", url: "/gameRecordSearch/" },
			{ name: "게시판", url: "/messageboard/" },
			{ name: "다운로드", url: "/download/" },
		],
		menu: [
			{ name: "관리", url: "/manage/" },
			{ name: "비밀번호 변경", url: "/changePassword/" },
		],
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
