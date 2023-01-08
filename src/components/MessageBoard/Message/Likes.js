import { useMutation, useQuery } from "@apollo/client";
import styled from "styled-components";
import { LIKE_MESSAGE, ME, UNLIKE_MESSAGE } from "../../../constants/querys";

function Likes({ messageId, likes }) {
	const { data } = useQuery(ME);
	const [likeMessage] = useMutation(LIKE_MESSAGE);
	const [unlikeMessage] = useMutation(UNLIKE_MESSAGE);
	const containMyLike = (likes) => {
		return likes.map((like) => like.userId).includes(data?.me?.id);
	};

	return (
		<LikesLayout
			onClick={() => {
				if (containMyLike(likes)) {
					unlikeMessage({ variables: { input: { messageId } } });
					return;
				}
				likeMessage({ variables: { input: { messageId } } });
			}}>
			{containMyLike(likes) ? (
				<img
					src={`${process.env.REACT_APP_BOKK_IMG}/like-on.png`}
					width="24px"
					alt="like"
				/>
			) : (
				<img
					src={`${process.env.REACT_APP_BOKK_IMG}/like.png`}
					width="24px"
					alt="like"
				/>
			)}
			{likes?.length || "좋아요"}
		</LikesLayout>
	);
}

export default Likes;

const LikesLayout = styled.div`
	display: inline-flex;
	cursor: pointer;
	gap: 0.25rem;
	:hover {
		transform: scale(1.1);
	}
`;
