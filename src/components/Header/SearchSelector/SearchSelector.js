import { useQuery } from "@apollo/client";
import { useState } from "react";
import { ME } from "../../../constants/querys";
import { BOKK_IMG } from "../../../constants/urls";
import GoogleSearch from "./Searches/GoogleSearch";
import NaverSearch from "./Searches/NaverSearch";
import YoutubeOffcanvas from "./YoutubeOffcanvas/YoutubeOffcanvas";

export default function SearchSelector() {
	const [searchIndex, setSearchIndex] = useState(0);
	const Searches = [<NaverSearch />, <GoogleSearch />];
	const { data } = useQuery(ME);
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
						src={`${BOKK_IMG}/Chrisbanks2-Cold-Fusion-Hd-Minecraft.ico`}
						style={{ width: "32px" }}
					/>
					<div id="status_minecraft"></div>
				</div>
				{data?.me ? (
					<div className="col-auto">
						<YoutubeOffcanvas />
					</div>
				) : null}
			</div>
			{Searches[searchIndex]}
		</div>
	);
}
