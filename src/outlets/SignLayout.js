import { Outlet } from "react-router-dom";
import styles from "./SignLayout.module.css";
import "./SignLayout.css";

export default function SignLayout() {
	return (
		<div className={styles.background}>
			<div className={styles.body}>
				<Outlet />
			</div>
		</div>
	);
}
