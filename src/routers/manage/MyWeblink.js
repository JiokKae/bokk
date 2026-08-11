import { useMutation, useQuery } from "@apollo/client";
import UpdateWeblinkModal from "../../components/Weblink/UpdateWeblinkModal";
import Weblink from "../../components/Weblink/Weblink";
import { DELETE_WEBLINK, OWN_WEBLINKS } from "../../constants/querys";

function WeblinkManageItem({
	className,
	weblink: { id, name, url, color, backgroundColor },
}) {
	const [deleteWeblink] = useMutation(DELETE_WEBLINK, {
		onCompleted: ({ deleteWeblink }) => {
			if (deleteWeblink === false) {
				alert("웹 링크를 제거하는데 실패했습니다");
				return;
			}
		},
		refetchQueries: [{ query: OWN_WEBLINKS }],
	});
	const onRemove = () => {
		if (window.confirm("정말 제거하시겠습니까?") === false) {
			return;
		}
		deleteWeblink({ variables: { weblinkId: id } });
	};
	return (
		<li className={className}>
			<div className="row align-items-center">
				<div className="col-12 col-sm-6">
					<Weblink
						name={name}
						url={url}
						color={color}
						backgroundColor={backgroundColor}
					/>
				</div>
				<div className="col-auto">
					<UpdateWeblinkModal
						weblink={{ id, name, url, color, backgroundColor }}
					/>
				</div>
				<div className="col-auto">
					<button className="btn btn-danger" onClick={onRemove}>
						삭제
					</button>
				</div>
			</div>
		</li>
	);
}

export default function MyWeblink() {
	const { data } = useQuery(OWN_WEBLINKS);
	const weblinks = data?.ownWeblinks || [];

	return (
		<ul className="list-group list-group-flush">
			{weblinks.map((weblink) => (
				<WeblinkManageItem
					className="list-group-item"
					key={weblink.id}
					weblink={weblink}
				/>
			))}
		</ul>
	);
}
