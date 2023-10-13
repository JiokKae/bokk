import { useQuery } from "@apollo/client";
import KakaoImageAPI from "../components/KakaoImageAPI";
import { ME } from "../constants/querys";
import { Link } from "react-router-dom";

function Image() {
	const { data, loading } = useQuery(ME);

	const isUser = () => {
		return !loading && data?.me;
	};

	return <>{isUser() ? <KakaoImageAPI /> : <NoticeForGuest />}</>;
}

function NoticeForGuest() {
	return (
		<h2>
			<b>Karlo - 이미지 생성</b>은 {<Link to="/signin/">로그인 </Link>}
			후에 이용할 수 있습니다.
		</h2>
	);
}

export default Image;
