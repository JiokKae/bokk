import { Outlet } from "react-router-dom";
import SearchSelector from "../components/Header/SearchSelector/SearchSelector";
import Navbar from "../components/Header/Navbar/Navbar";
import styles from "./HeaderLayout.module.css";

export default function HeaderLayout({ items, searchSelector }) {
	return (
		<div>
			<Navbar items={items} />
			<div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4">
				{searchSelector ? (
					<div className={styles.header}>
						<SearchSelector />
					</div>
				) : null}
				<div className="my-5 px-2 sm:px-4">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
