import { useQuery } from "@apollo/client";
import DownloadCard from "../components/DownloadCard";
import { FILES } from "../querys";

export default function Download() {
	const { data } = useQuery(FILES);
	return (
		<div className="row">
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
