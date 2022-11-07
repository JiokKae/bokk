import YouTube from "react-youtube";

export default function YoutubePlayer({ firstVideoId, ...props }) {
	const opts = {
		height: "320",
		width: "640",
		playerVars: {
			// https://developers.google.com/youtube/player_parameters
			// autoplay: 1,
		},
	};

	return <YouTube {...props} videoId={firstVideoId} opts={opts} />;
}
