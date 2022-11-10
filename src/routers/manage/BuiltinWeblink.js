import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import Weblink from "../../components/Weblink/Weblink";
import { BUILTIN_WEBLINKS, TOGGLE_BUILTIN_WEBLINK } from "../../querys";

export default function BuiltinWeblink() {
	const [builtinWeblinks, setBuiltinWeblinks] = useState([]);
	const [hidedIds, setHidedIds] = useState([]);

	const { refetch } = useQuery(BUILTIN_WEBLINKS, {
		variables: { input: { hided: true } },
		onCompleted: (data) => {
			setBuiltinWeblinks(data.builtinWeblinks.weblinks);
			setHidedIds(data.builtinWeblinks.hidedIds);
		},
	});

	const [toggleBuitinWeblink] = useMutation(TOGGLE_BUILTIN_WEBLINK, {
		onCompleted: ({ toggleBuiltinWeblink }) => {
			if (toggleBuiltinWeblink) {
				refetch();
				return;
			}
			alert("기본 웹 링크를 토글하는데 실패했습니다.");
		},
	});
	return (
		<>
			<div>
				<div>
					<small>
						웹링크를 클릭해서 숨기거나 보이게 할 수 있습니다.
					</small>
				</div>
				{builtinWeblinks.map(({ id, name, color, backgroundColor }) => (
					<Weblink
						key={id}
						name={name}
						color={color}
						backgroundColor={backgroundColor}
						style={
							hidedIds.includes(id) ? { opacity: "0.4" } : null
						}
						onClick={() =>
							toggleBuitinWeblink({
								variables: { weblinkId: id },
							})
						}
					/>
				))}
			</div>
		</>
	);
}
