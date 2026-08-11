import { useMutation, useQuery } from "@apollo/client";
import { CloseButton } from "react-bootstrap";
import YoutubeVideoAdder from "../../components/Header/SearchSelector/YoutubeOffcanvas/YoutubeVideoAdder";
import { DELETE_VIDEO_ITEM, MY_VIDEO_ITEMS } from "../../constants/querys";
import { secondToDate, thumbnailUrl } from "../../utils/youtubeUtil";

function VideoItem({ itemId, youtubeId, title, length }) {
	const [deleteVideoItem] = useMutation(DELETE_VIDEO_ITEM, {
		onCompleted: ({ deleteVideoItem }) => {
			if (deleteVideoItem === false) {
				alert("영상을 제거하는데 실패했습니다.");
				return;
			}
		},
		refetchQueries: [{ query: MY_VIDEO_ITEMS }],
	});
	const onClick = () => {
		if (window.confirm("영상을 제거하시겠습니까?") === false) {
			return;
		}
		deleteVideoItem({ variables: { itemId } });
	};
	return (
		<div className="list-group-item">
			<div className="row">
				<div className="col-auto">
					<img
						className="rounded img-fluid"
						src={thumbnailUrl(youtubeId)}
						alt={title}
					/>
				</div>
				<div className="col-8 me-auto">
					<p className="mb-1">{title}</p>
					<small>{secondToDate(length)}</small>
				</div>
				<div className="col-auto">
					<CloseButton onClick={onClick} />
				</div>
			</div>
		</div>
	);
}

export default function Playlist() {
	const { data } = useQuery(MY_VIDEO_ITEMS);
	const videosItems = data?.myVideoItems || [];

	return (
		<>
			<YoutubeVideoAdder />
			<div className="list-group">
				{videosItems.map(
					({ id: ItemId, video: { id, title, length } }) => (
						<VideoItem
							key={ItemId}
							itemId={ItemId}
							youtubeId={id}
							title={title}
							length={length}
						/>
					)
				)}
			</div>
		</>
	);
}
