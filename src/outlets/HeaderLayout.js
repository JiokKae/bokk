import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";

export default function HeaderLayout() {
	return (
		<div>
			<Header />
			<div className="container">
				<Outlet />
			</div>
		</div>
	);
}
