import { useState } from "react";
import GoogleSearch from "./Searches/GoogleSearch";
import NaverSearch from "./Searches/NaverSearch";

export default function SearchSelector() {
	const [searchIndex, setSearchIndex] = useState(0);
	const Searches = [<NaverSearch />, <GoogleSearch />];
	return (
		<div>
			<div className="row m-2 gx-2">
				<div
					id="tab_naver"
					className="col-auto pointer"
					onClick={() => {
						setSearchIndex(0);
					}}>
					<img src="https://www.naver.com/favicon.ico" />
				</div>
				<div
					id="tab_google"
					className="col-auto pointer me-auto"
					onClick={() => {
						setSearchIndex(1);
					}}>
					<img src="https://www.google.com/favicon.ico" />
				</div>
				<div className="col-auto">
					<img
						src="https://jiokkae.com/볶음밥/img/Chrisbanks2-Cold-Fusion-Hd-Minecraft.ico"
						style={{ width: "32px" }}
					/>
					<div id="status_minecraft"></div>
				</div>
				<div className="col-auto">
					<a
						data-bs-toggle="offcanvas"
						href="#offcanvasYoutubeQueue"
						role="button"
						aria-controls="offcanvasYoutubeQueue">
						<img
							src="https://jiokkae.com/볶음밥/img/YouTube-icon.png"
							alt="유튜브 재생 목록"
						/>
					</a>
				</div>
			</div>
			{Searches[searchIndex]}
		</div>
	);
}
