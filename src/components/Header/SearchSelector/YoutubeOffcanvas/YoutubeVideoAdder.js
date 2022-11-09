import { useMutation } from "@apollo/client";
import { useState } from "react";
import { ADD_VIDEO_ITEM, OWN_YOUTUBE_VIDEOS } from "../../../../querys";
import { videoId } from "../../../../utils/youtubeUtil";

export default function YoutubeVideoAdder() {
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const onSubmit = (e) => {
		e.preventDefault();
		addVideoItem({
			variables: { input: { videoId: videoId(youtubeUrl) } },
		});
	};
	const [addVideoItem] = useMutation(ADD_VIDEO_ITEM, {
		onCompleted: (data) => {
			if (data?.addVideoItem.video) {
				setYoutubeUrl("");
				return;
			}
			alert("영상을 추가하지 못했습니다.\nURL을 확인해주세요.");
		},
		refetchQueries: [{ query: OWN_YOUTUBE_VIDEOS }],
	});
	return (
		<form onSubmit={onSubmit}>
			<div className="input-group mb-2">
				<input
					type="url"
					className="form-control"
					placeholder="https://youtu.be/example"
					required
					value={youtubeUrl}
					onChange={(e) => setYoutubeUrl(e.target.value)}
				/>
				<input
					type="submit"
					className="btn btn-outline-secondary"
					value="추가"
				/>
			</div>
		</form>
	);
}
