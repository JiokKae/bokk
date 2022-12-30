import styles from "./GoogleSearch.module.css";

export default function GoogleSearch() {
	return (
		<div id="google" style={{ marginTop: "20px" }}>
			<center>
				<a
					href="https://www.google.com/"
					target="_blank"
					rel="noopener noreferrer">
					<img
						alt="Google"
						height="92"
						id="hplogo"
						src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
						srcSet="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png 2x"
						width="272"
						data-atf="3"
					/>
				</a>

				<form
					className={styles.tsf}
					action="https://www.google.com/search"
					method="GET"
					name="f"
					role="search">
					<div className={styles.RNNXgb}>
						<input
							className={styles.gsfi}
							id="lst-ib"
							maxLength="2048"
							name="q"
							autoComplete="off"
							title="검색"
							type="search"
						/>
					</div>
				</form>
			</center>
		</div>
	);
}
