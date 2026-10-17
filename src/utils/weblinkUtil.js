export const WEBLINK_DATE_TOKEN_GROUPS = [
	{
		category: "연도",
		tokens: [
			{
				token: "{YYYY}",
				getExample: (now = new Date()) => String(now.getFullYear()),
			},
			{
				token: "{YY}",
				getExample: (now = new Date()) => String(now.getFullYear()).slice(-2),
			},
		],
	},
	{
		category: "월",
		tokens: [
			{
				token: "{MM}",
				getExample: (now = new Date()) =>
					String(now.getMonth() + 1).padStart(2, "0"),
			},
			{
				token: "{M}",
				getExample: (now = new Date()) => String(now.getMonth() + 1),
			},
		],
	},
	{
		category: "일",
		tokens: [
			{
				token: "{DD}",
				getExample: (now = new Date()) =>
					String(now.getDate()).padStart(2, "0"),
			},
			{
				token: "{D}",
				getExample: (now = new Date()) => String(now.getDate()),
			},
		],
	},
];

const DYNAMIC_DATE_REGEX = /\{(YYYY|YY|MM|M|DD|D)\}/gi;

export function hasDynamicDateToken(text) {
	if (!text || typeof text !== "string") return false;
	return /\{(YYYY|YY|MM|M|DD|D)\}/i.test(text);
}

export function formatWeblinkDynamicText(text, now = new Date()) {
	if (!text || typeof text !== "string") return text || "";

	const year4 = String(now.getFullYear());
	const year2 = year4.slice(-2);
	const month1 = String(now.getMonth() + 1);
	const month2 = month1.padStart(2, "0");
	const day1 = String(now.getDate());
	const day2 = day1.padStart(2, "0");

	return text.replace(DYNAMIC_DATE_REGEX, (match, token) => {
		switch (token.toUpperCase()) {
			case "YYYY":
				return year4;
			case "YY":
				return year2;
			case "MM":
				return month2;
			case "M":
				return month1;
			case "DD":
				return day2;
			case "D":
				return day1;
			default:
				return match;
		}
	});
}

export function getResolvedWeblinkUrl(url, now = new Date()) {
	if (!url) return "#";
	if (url === "#") return "#";
	const resolved = formatWeblinkDynamicText(url, now);
	return /^https?:\/\//i.test(resolved) ? resolved : `https://${resolved}`;
}
