import { secondToDate, thumbnailUrl } from "../../../../utils/youtubeUtil";

export default function YoutubeVideoItem({
	index,
	currentVideoIndex,
	onClick,
	id,
	title,
	length,
}) {
	return (
		<a
			id={`videoItem${index}`}
			className={`list-group-item list-group-item-action pointer ${
				index === currentVideoIndex ? "bgc-bokk-light" : ""
			}`}
			onClick={onClick}>
			<div className="row gx-3">
				<div className="col-3">
					<img className="rounded img-fluid" src={thumbnailUrl(id)} />
				</div>
				<div className="col">
					<p className="mb-1">{title}</p>
					<small>{secondToDate(length)}</small>
				</div>
			</div>
		</a>
	);
}
