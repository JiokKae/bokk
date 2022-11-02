import { gql } from "@apollo/client";

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

export const FILES = gql`
	query Files {
		files {
			url
			date
			size
		}
	}
`;
