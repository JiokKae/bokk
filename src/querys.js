import { gql } from "@apollo/client";

export const FILES = gql`
	query Files {
		files {
			url
			date
			size
		}
	}
`;
