import { useQuery } from "@apollo/client";
import DownloadCard from "../components/DownloadCard";
import { FILES } from "../constants/querys";

export default function Download() {
	const { data } = useQuery(FILES);
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{data?.files.map((file) => (
				<DownloadCard
					key={file.url}
					href={file.url}
					date={file.date}
					size={parseInt(file.size)}
				/>
			))}
		</div>
	);
}
