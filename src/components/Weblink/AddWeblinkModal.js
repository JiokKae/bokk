import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { ADD_WEBLINK, MY_WEBLINK_GROUPS, OWN_WEBLINKS } from "../../constants/querys";
import WeblinkForm from "./WeblinkForm";

const createInitialValues = (defaultGroupId) => ({
	name: "",
	url: "",
	color: "#FFFFFF",
	backgroundColor: "#1EA1F7",
	groupId: defaultGroupId ?? "",
});

export default function AddWeblinkModal({ position = "last", defaultGroupId = null }) {
	const [show, setShow] = useState(false);
	const [formValues, setFormValues] = useState(() =>
		createInitialValues(defaultGroupId)
	);

	const { data: groupData } = useQuery(MY_WEBLINK_GROUPS);
	const groups = groupData?.myWeblinkGroups || [];

	const [addWeblink] = useMutation(ADD_WEBLINK, {
		refetchQueries: [{ query: OWN_WEBLINKS }, { query: MY_WEBLINK_GROUPS }],
	});

	const handleFieldChange = (field, value) => {
		setFormValues((prev) => ({ ...prev, [field]: value }));
	};

	const handleOpen = () => {
		setFormValues(createInitialValues(defaultGroupId));
		setShow(true);
	};

	const onSubmit = () => {
		const { name, url, color, backgroundColor, groupId } = formValues;
		addWeblink({
			variables: {
				input: {
					name,
					url,
					color,
					backgroundColor,
					position,
					groupId: groupId ? Number(groupId) : null,
				},
			},
		});
		setShow(false);
	};

	return (
		<>
			<button
				className="btn btn-dot m-1 user-select-none"
				style={{ userSelect: "none" }}
				onMouseDown={(e) => e.preventDefault()}
				onClick={handleOpen}>
				+
			</button>
			<Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header closeButton>
					<Modal.Title as="h5">웹 링크 추가</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<WeblinkForm
						id="addWeblinkForm"
						onSubmit={onSubmit}
						values={formValues}
						onChange={handleFieldChange}
						groups={groups}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button
						form="addWeblinkForm"
						type="submit"
						variant="primary">
						추가
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
