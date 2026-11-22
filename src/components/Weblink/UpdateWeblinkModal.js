import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { MY_WEBLINK_GROUPS, OWN_WEBLINKS, UPDATE_WEBLINK } from "../../constants/querys";
import WeblinkForm from "./WeblinkForm";

const createValuesFromWeblink = (weblink) => ({
	name: weblink.name,
	url: weblink.url,
	color: weblink.color,
	backgroundColor: weblink.backgroundColor,
	groupId: weblink.groupId ?? "",
});

export default function UpdateWeblinkModal({ weblink }) {
	const [show, setShow] = useState(false);
	const [formValues, setFormValues] = useState(() =>
		createValuesFromWeblink(weblink)
	);

	const { data: groupData } = useQuery(MY_WEBLINK_GROUPS);
	const groups = groupData?.myWeblinkGroups || [];

	const handleFieldChange = (field, value) => {
		setFormValues((prev) => ({ ...prev, [field]: value }));
	};

	const isChange = () => {
		const { name, url, color, backgroundColor, groupId } = formValues;
		if (name !== weblink.name) return true;
		if (url !== weblink.url) return true;
		if (color !== weblink.color) return true;
		if (backgroundColor !== weblink.backgroundColor) return true;
		if (String(groupId ?? "") !== String(weblink.groupId ?? "")) return true;
		return false;
	};

	const [updateWeblink] = useMutation(UPDATE_WEBLINK, {
		refetchQueries: [{ query: OWN_WEBLINKS }, { query: MY_WEBLINK_GROUPS }],
	});

	const onSubmit = () => {
		setShow(false);
		if (isChange() === false) {
			return;
		}
		const { name, url, color, backgroundColor, groupId } = formValues;
		updateWeblink({
			variables: {
				input: {
					id: weblink.id,
					name,
					url,
					color,
					backgroundColor,
					groupId: groupId ? Number(groupId) : null,
				},
			},
		});
	};

	const handleOpen = () => {
		setFormValues(createValuesFromWeblink(weblink));
		setShow(true);
	};

	return (
		<>
			<button className="btn btn-secondary" onClick={handleOpen}>
				수정
			</button>
			<Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header closeButton>
					<Modal.Title as="h5">웹링크 수정</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<WeblinkForm
						id="updateWeblinkForm"
						onSubmit={onSubmit}
						values={formValues}
						onChange={handleFieldChange}
						groups={groups}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button
						form="updateWeblinkForm"
						type="submit"
						variant="primary">
						수정
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
