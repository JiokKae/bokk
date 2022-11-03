import { gql } from "@apollo/client";

export const SIGNIN = gql`
	mutation Signin($signinId: String!, $password: String!) {
		signin(id: $signinId, password: $password)
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

export const FILES = gql`
	query Files {
		files {
			url
			date
			size
		}
	}
`;
