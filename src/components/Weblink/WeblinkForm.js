import { Col, Form, Row } from "react-bootstrap";
import Weblink from "./Weblink";

export default function WeblinkForm({
	id,
	className,
	onSubmit,
	name,
	setName,
	url,
	setUrl,
	color,
	setColor,
	backgroundColor,
	setBackgroundColor,
}) {
	return (
		<Form
			id={id}
			className={`row g-3 ${className}`}
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(e);
				e.target.reset();
			}}>
			<Form.Group className="col-auto">
				<Form.Label htmlFor="name">이름</Form.Label>
				<Form.Control
					type="text"
					id="name"
					maxLength={10}
					pattern="[A-Za-z0-9ㄱ-힣 ]{1,10}"
					required
					value={name}
					onInput={(e) => setName(e.target.value)}
				/>
			</Form.Group>
			<Form.Group className="col-12">
				<Form.Label htmlFor="url">URL</Form.Label>
				<Form.Control
					type="url"
					id="url"
					placeholder="https://example.com"
					pattern="(http|https):\/\/[^'\s()]+"
					required
					value={url}
					onChange={(e) => setUrl(e.target.value)}
				/>
			</Form.Group>
			<Col>
				<Row>
					<Form.Group className="col-auto">
						<Form.Label htmlFor="color">글자 색상</Form.Label>
						<Form.Control
							type="color"
							id="color"
							onInput={(e) => setColor(e.target.value)}
							value={color}></Form.Control>
					</Form.Group>
					<Form.Group className="col-auto">
						<Form.Label htmlFor="backgroundColor">
							배경 색상
						</Form.Label>
						<Form.Control
							type="color"
							id="backgroundColor"
							onInput={(e) => setBackgroundColor(e.target.value)}
							value={backgroundColor}></Form.Control>
					</Form.Group>
					<Col>
						<Form.Label>미리보기</Form.Label>
						<Weblink
							name={name}
							color={color}
							backgroundColor={backgroundColor}
						/>
					</Col>
				</Row>
			</Col>
		</Form>
	);
}
