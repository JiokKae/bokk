import { gql } from "@apollo/client";

export const CORE_MESSAGE_FIELDS = gql`
	fragment CoreMessageFields on Message {
		id
		type
		content
		time
		writer {
			name
			type
			id
		}
	}
`;
