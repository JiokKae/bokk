import { gql } from "@apollo/client";
import { CORE_MESSAGE_FIELDS } from "./fragments";

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

export const CHANGE_PASSWORD = gql`
	mutation ChangePassword($input: ChangePasswordInput!) {
		changePassword(input: $input) {
			success
		}
	}
`;

export const IS_LOGIN = gql`
	query Me {
		me {
			id
			name
		}
	}
`;

export const GET_BUILTIN_WEBLINK = gql`
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

export const FILES = gql`
	query Files {
		files {
			url
			date
			size
		}
	}
`;

export const QUERIES_AFFECTED_BY_SIGN = [
	{ query: IS_LOGIN },
	{ query: FILES },
	{ query: OWN_WEBLINKS },
	{ query: GET_BUILTIN_WEBLINK },
];
