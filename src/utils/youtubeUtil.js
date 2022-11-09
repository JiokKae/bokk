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
