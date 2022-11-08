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
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<HeaderLayout />}>
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
