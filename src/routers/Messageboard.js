import { gql } from "@apollo/client";
import { CORE_MESSAGE_FIELDS } from "../fragments";

const GET_DATA = gql`
	${CORE_MESSAGE_FIELDS}
	query Me($page: Int!) {
		me {
			id
		}
		messageboard(page: $page) {
			messages {
				...CoreMessageFields
				reply {
					reply {
						...CoreMessageFields
					}
				}
			}
		}
	}
`;

export default function MessageBoard() {
	return <div>게시판</div>;
}
