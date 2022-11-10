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
	query BuiltinWeblinks {
		builtinWeblinks {
			name
			url
			color
			backgroundColor
			id
		}
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
			}
			totalCount
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

export const QUERIES_AFFECTED_BY_SIGN = [
	{ query: ME },
	{ query: FILES },
	{ query: OWN_WEBLINKS },
	{ query: BUILTIN_WEBLINKS },
	{ query: MY_VIDEO_ITEMS },
];
