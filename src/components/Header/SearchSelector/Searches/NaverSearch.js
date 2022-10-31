import styles from "./NaverSearch.module.css";

export default function NaverSearch() {
	return (
		<div id="naver">
			<center>
				<div className={styles.special_bg}>
					<div className="area_flex">
						<div className={styles.area_logo}>
							<h1>
								<a
									data-clk="top.logo"
									href="https://www.naver.com/"
									target="_blank">
									<span className={styles.naver_logo}>
										네이버
									</span>
								</a>
							</h1>
						</div>

						<div id="search" className={styles.search}>
							<form
								id="sform"
								name="sform"
								action="https://search.naver.com/search.naver"
								method="get">
								<input
									type="hidden"
									id="sm"
									name="sm"
									value="top_hty"
								/>
								<input
									type="hidden"
									id="fbm"
									name="fbm"
									value="1"
								/>
								<input
									type="hidden"
									id="acr"
									name="acr"
									value=""
									disabled=""
								/>
								<input
									type="hidden"
									id="acq"
									name="acq"
									value=""
									disabled=""
								/>
								<input
									type="hidden"
									id="qdt"
									name="qdt"
									value="0"
									disabled=""
								/>
								<input
									type="hidden"
									id="ie"
									name="ie"
									value="utf8"
								/>
								<input
									type="hidden"
									id="acir"
									name="acir"
									value=""
									disabled=""
								/>
								<input
									type="hidden"
									id="os"
									name="os"
									value=""
									disabled=""
								/>
								<input
									type="hidden"
									id="bid"
									name="bid"
									value=""
									disabled=""
								/>
								<input
									type="hidden"
									id="pkid"
									name="pkid"
									value=""
									disabled=""
								/>
								<input
									type="hidden"
									id="eid"
									name="eid"
									value=""
									disabled=""
								/>
								<input
									type="hidden"
									id="mra"
									name="mra"
									value=""
									disabled=""
								/>
								<span className={styles.green_window}>
									<input
										id="query"
										name="query"
										type="text"
										title="검색어 입력"
										maxLength="255"
										className={styles.input_text}
										tabIndex="1"
										accessKey="s"
										autoComplete="off"
									/>
								</span>
							</form>
						</div>
					</div>
				</div>
			</center>
		</div>
	);
}
