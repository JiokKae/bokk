import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./routers/Home";
import GameRecordSearch from "./routers/GameRecordSearch";
import MessageBoard from "./routers/Messageboard";
import Download from "./routers/Download";
import Signin from "./routers/Signin";
import HeaderLayout from "./outlets/HeaderLayout";

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
				<Route path="/signin/" element={<Signin />} />
			</Routes>
		</BrowserRouter>
	);
}
