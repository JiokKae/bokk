/**
 * @link https://stackoverflow.com/questions/5830387/how-do-i-find-all-youtube-video-ids-in-a-string-using-a-regex/6901180#6901180
 * @param {string} youtubeUrl
 * @return {string} videoId
 */
export function videoId(youtubeUrl) {
	if (youtubeUrl === null) return "";
	var regex =
		/https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi;
	return youtubeUrl.replace(regex, "$1");
}

export function extractYoutubeVideoId(youtubeUrl) {
	if (!youtubeUrl || typeof youtubeUrl !== "string") return "";
	const match = youtubeUrl.match(
		/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/
	);
	return match && match[2] && match[2].length === 11 ? match[2] : "";
}

export const RESOLUTION = { MQ: "mq", HQ: "hq", MAX: "maxres" };
export function thumbnailUrl(videoId, resolution = "") {
	return `https://img.youtube.com/vi/${videoId}/${resolution}default.jpg`;
}

/**
 * 유튜브는 없는 썸네일(404) 요청 시 120x90 더미 이미지를 성공 상태로 반환하므로 감지하여 HQ로 폴백
 */
export function handleYoutubeThumbnailLoad(e, videoId) {
	if (e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
		const fallbackUrl = thumbnailUrl(videoId, RESOLUTION.HQ);
		if (e.target.src !== fallbackUrl) {
			e.target.src = fallbackUrl;
		}
	}
}

export function handleYoutubeThumbnailError(e, videoId) {
	const fallbackUrl = thumbnailUrl(videoId, RESOLUTION.HQ);
	if (e.target.src !== fallbackUrl) {
		e.target.src = fallbackUrl;
	}
}

export const secondToDate = (second) => {
	var date = new Date(0);
	date.setSeconds(second);
	if (second >= 3600) {
		return date.toISOString().substring(11, 19);
	} else {
		return date.toISOString().substring(14, 19);
	}
};
