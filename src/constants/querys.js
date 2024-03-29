import { gql } from "@apollo/client";
import { CORE_MESSAGE_FIELDS } from "./fragments";

export const SIGNUP = gql`
	mutation Signup($input: SignupInput!) {
		signup(input: $input) {
			completed
			key
			message
		}
	}
`;

export const SIGNIN = gql`
	mutation Signin($signinId: String!, $password: String!) {
		signin(id: $signinId, password: $password)
	}
`;

export const SIGNOUT = gql`
	mutation Signout {
		signout
	}
`;

export const SET_USER_CONFIG = gql`
	mutation SetUserConfig($input: SetUserConfigInput!) {
		setUserConfig(input: $input) {
			config {
				videoAutoPlay
			}
		}
	}
`;

export const CHANGE_PASSWORD = gql`
	mutation ChangePassword($input: ChangePasswordInput!) {
		changePassword(input: $input) {
			success
		}
	}
`;

export const ME = gql`
	query Me {
		me {
			id
			name
			config {
				videoAutoPlay
			}
		}
	}
`;

export const BUILTIN_WEBLINKS = gql`
	query BuiltinWeblinks($input: BuiltinWeblinksInput) {
		builtinWeblinks(input: $input) {
			hidedIds
			weblinks {
				name
				url
				color
				backgroundColor
				id
			}
		}
	}
`;

export const TOGGLE_BUILTIN_WEBLINK = gql`
	mutation ToggleBuiltinWeblink($weblinkId: Int!) {
		toggleBuiltinWeblink(weblinkId: $weblinkId)
	}
`;

export const OWN_WEBLINKS = gql`
	query OwnWeblinks {
		ownWeblinks {
			name
			url
			color
			backgroundColor
			id
		}
	}
`;

export const ADD_WEBLINK = gql`
	mutation Mutation($input: AddWeblinkInput!) {
		addWeblink(input: $input) {
			weblink {
				name
				url
				color
				backgroundColor
				id
			}
		}
	}
`;

export const UPDATE_WEBLINK = gql`
	mutation UpdateWeblink($input: UpdateWeblinkInput!) {
		updateWeblink(input: $input) {
			weblink {
				name
				url
				color
				backgroundColor
				id
			}
		}
	}
`;

export const DELETE_WEBLINK = gql`
	mutation DeleteWeblink($weblinkId: Int!) {
		deleteWeblink(weblinkId: $weblinkId)
	}
`;

export const MESSAGEBOARD = gql`
	${CORE_MESSAGE_FIELDS}
	query Messageboard($page: Int!) {
		messageboard(page: $page) {
			messages {
				...CoreMessageFields
				reply {
					...CoreMessageFields
				}
				likes {
					userId
				}
			}
			totalCount
		}
	}
`;

export const LIKE_MESSAGE = gql`
	mutation LikeMessage($input: LikeMessageInput!) {
		likeMessage(input: $input) {
			message {
				id
				type
				likes {
					userId
				}
			}
		}
	}
`;

export const UNLIKE_MESSAGE = gql`
	mutation UnlikeMessage($input: UnlikeMessageInput!) {
		unlikeMessage(input: $input) {
			message {
				id
				type
				likes {
					userId
				}
			}
		}
	}
`;

export const POST_MESSAGE = gql`
	mutation PostMessage($input: PostMessageInput!) {
		postMessage(input: $input) {
			completed
		}
	}
`;

export const DELETE_MESSAGE = gql`
	mutation DeleteMessage($input: DeleteMessageInput!) {
		deleteMessage(input: $input) {
			success
		}
	}
`;

export const FILES = gql`
	query Files {
		files {
			url
			date
			size
		}
	}
`;

export const MY_VIDEO_ITEMS = gql`
	query MyVideoItems {
		myVideoItems {
			id
			video {
				id
				title
				length
			}
		}
	}
`;

export const ADD_VIDEO_ITEM = gql`
	mutation AddVideoItem($input: AddVideoItemInput!) {
		addVideoItem(input: $input) {
			video {
				id
				length
				title
			}
		}
	}
`;

export const DELETE_VIDEO_ITEM = gql`
	mutation DeleteVideoItem($itemId: Int!) {
		deleteVideoItem(itemId: $itemId)
	}
`;

export const TEXT_TO_IMAGE = gql`
	mutation TextToImage($input: TextToImageInput!) {
		textToImage(input: $input) {
			image
			nsfw
		}
	}
`;

export const KAKAO_API_QUOTAS = gql`
	query KakaoAPIQuotas {
		kakaoAPIQuotas {
			karlo {
				current
				limit
			}
		}
	}
`;

export const QUERIES_AFFECTED_BY_SIGN = [
	{ query: ME },
	{ query: FILES },
	{ query: OWN_WEBLINKS },
	{ query: BUILTIN_WEBLINKS },
	{ query: MY_VIDEO_ITEMS },
	{ query: KAKAO_API_QUOTAS },
];
