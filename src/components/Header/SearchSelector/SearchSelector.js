import { useQuery } from "@apollo/client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ME } from "../../../constants/querys";
import FeatureHistoryModal from "./FeatureHistoryModal";
import GoogleSearch from "./Searches/GoogleSearch";
import NaverSearch from "./Searches/NaverSearch";
import YoutubeOffcanvas from "./YoutubeOffcanvas/YoutubeOffcanvas";

export default function SearchSelector() {
	const [searchIndex, setSearchIndex] = useState(0);
	const Searches = [<NaverSearch />, <GoogleSearch />];
	const { data } = useQuery(ME);

	return (
		<div>
			<div className="my-2 flex flex-nowrap items-center gap-2 overflow-hidden px-1">
				<button
					type="button"
					id="tab_naver"
					onClick={() => setSearchIndex(0)}
					className={cn(
						"inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-1 transition-all",
						searchIndex === 0
							? "ring-2 ring-emerald-500/40"
							: "opacity-65 hover:opacity-100"
					)}
				>
					<img
						src="https://www.naver.com/favicon.ico"
						alt="네이버 검색 선택"
						className="block size-7 rounded"
					/>
				</button>

				<button
					type="button"
					id="tab_google"
					onClick={() => setSearchIndex(1)}
					className={cn(
						"mr-auto inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-1 transition-all",
						searchIndex === 1
							? "ring-2 ring-bokk/40"
							: "opacity-65 hover:opacity-100"
					)}
				>
					<img
						src="https://www.google.com/favicon.ico"
						alt="구글 검색 선택"
						className="block size-7 rounded"
					/>
				</button>

				<div className="shrink-0">
					<FeatureHistoryModal />
				</div>

				<div className="shrink-0">
					<img
						src={`${process.env.REACT_APP_BOKK_IMG}/Chrisbanks2-Cold-Fusion-Hd-Minecraft.ico`}
						className="block size-8"
						alt=""
					/>
					<div id="status_minecraft"></div>
				</div>

				{data?.me ? (
					<div className="flex min-w-0 shrink">
						<YoutubeOffcanvas />
					</div>
				) : null}
			</div>
			{Searches[searchIndex]}
		</div>
	);
}
