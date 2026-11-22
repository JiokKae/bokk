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

export const WEBLINK_GROUP_ID = {
	BUILTIN: 0,
	UNTAGGED: -1,
};

export function normalizeTargetGroupId(targetGroupId) {
	if (
		targetGroupId === null ||
		targetGroupId === undefined ||
		targetGroupId === "untagged" ||
		Number(targetGroupId) === WEBLINK_GROUP_ID.UNTAGGED
	) {
		return null;
	}
	return Number(targetGroupId);
}

export function isUntaggedWeblink(weblink, groups = []) {
	if (!weblink?.groupId) return true;
	return !groups.some((g) => g.id > 0 && g.id === weblink.groupId);
}

/**
 * 드래그 중인 웹링크를 대상 그룹의 특정 위치(targetIndex가 null이면 빈 그룹 이동)로 재배치한 새 배열 반환
 */
export function reorderWeblinksAcrossGroups(
	weblinks,
	groups,
	draggedId,
	targetGroupId,
	targetIndex = null
) {
	const draggedItem = weblinks.find((w) => w.id === draggedId);
	if (!draggedItem) return null;

	const normTargetGroupId = normalizeTargetGroupId(targetGroupId);

	// 빈 그룹 드롭 시 이미 같은 그룹 소속이면 변경 불필요
	if (
		targetIndex === null &&
		(draggedItem.groupId ?? null) === normTargetGroupId
	) {
		return null;
	}

	const customGroups = groups.filter((g) => g.id > 0);
	const updatedItem = { ...draggedItem, groupId: normTargetGroupId };

	const targetGroupItems = weblinks.filter(
		(w) =>
			(normTargetGroupId === null
				? isUntaggedWeblink(w, customGroups)
				: w.groupId === normTargetGroupId) && w.id !== draggedItem.id
	);
	if (targetIndex === null) {
		targetGroupItems.push(updatedItem);
	} else {
		targetGroupItems.splice(targetIndex, 0, updatedItem);
	}

	const newWeblinks = [];
	customGroups.forEach((g) => {
		if (g.id === normTargetGroupId) {
			newWeblinks.push(...targetGroupItems);
		} else {
			newWeblinks.push(
				...weblinks.filter(
					(w) => w.groupId === g.id && w.id !== draggedItem.id
				)
			);
		}
	});

	if (normTargetGroupId === null) {
		newWeblinks.push(...targetGroupItems);
	} else {
		newWeblinks.push(
			...weblinks.filter(
				(w) => isUntaggedWeblink(w, customGroups) && w.id !== draggedItem.id
			)
		);
	}

	return newWeblinks;
}

export function getResolvedWeblinkUrl(url, now = new Date()) {
	if (!url) return "#";
	if (url === "#") return "#";
	const resolved = formatWeblinkDynamicText(url, now);
	return /^https?:\/\//i.test(resolved) ? resolved : `https://${resolved}`;
}
