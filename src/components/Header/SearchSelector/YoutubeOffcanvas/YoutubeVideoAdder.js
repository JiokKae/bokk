import { useMutation } from "@apollo/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADD_VIDEO_ITEM, MY_VIDEO_ITEMS } from "../../../../constants/querys";
import { videoId } from "../../../../utils/youtubeUtil";

export default function YoutubeVideoAdder() {
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [addVideoItem, { loading }] = useMutation(ADD_VIDEO_ITEM, {
		onCompleted: (data) => {
			if (data?.addVideoItem.video) {
				setYoutubeUrl("");
				return;
			}
			alert("영상을 추가하지 못했습니다.\nURL을 확인해주세요.");
		},
		refetchQueries: [{ query: MY_VIDEO_ITEMS }],
	});

	const onSubmit = (e) => {
		e.preventDefault();
		addVideoItem({
			variables: { input: { videoId: videoId(youtubeUrl) } },
		});
	};

	return (
		<form onSubmit={onSubmit} className="mb-2.5 flex items-center gap-2">
			<Input
				type="url"
				placeholder="https://youtu.be/example"
				required
				value={youtubeUrl}
				onChange={(e) => setYoutubeUrl(e.target.value)}
				disabled={loading}
			/>
			<Button
				type="submit"
				variant="outline"
				className="h-9 shrink-0 px-3.5"
				disabled={loading}
			>
				{loading ? "..." : "추가"}
			</Button>
		</form>
	);
}
