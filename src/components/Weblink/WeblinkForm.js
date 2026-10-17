import { useRef, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import {
	WEBLINK_DATE_TOKEN_GROUPS,
	formatWeblinkDynamicText,
	hasDynamicDateToken,
} from "../../utils/weblinkUtil";
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
	groupId,
	setGroupId,
	groups = [],
}) {
	const nameInputRef = useRef(null);
	const urlInputRef = useRef(null);
	const [activeField, setActiveField] = useState("url");
	const [isFormatOpen, setIsFormatOpen] = useState(
		() => hasDynamicDateToken(name) || hasDynamicDateToken(url)
	);

	const handleInsertToken = (token) => {
		const isNameTarget = activeField === "name";
		const inputEl = isNameTarget ? nameInputRef.current : urlInputRef.current;
		const currentValue = (isNameTarget ? name : url) || "";
		const setter = isNameTarget ? setName : setUrl;

		if (!inputEl) {
			setter(currentValue + token);
			return;
		}

		const start =
			typeof inputEl.selectionStart === "number"
				? inputEl.selectionStart
				: currentValue.length;
		const end =
			typeof inputEl.selectionEnd === "number"
				? inputEl.selectionEnd
				: currentValue.length;

		const nextValue =
			currentValue.slice(0, start) + token + currentValue.slice(end);
		setter(nextValue);

		const nextCursorPos = start + token.length;
		requestAnimationFrame(() => {
			if (inputEl) {
				inputEl.focus();
				try {
					inputEl.setSelectionRange(nextCursorPos, nextCursorPos);
				} catch (_) {
					// ignore if selection range is unsupported
				}
			}
		});
	};

	const now = new Date();
	const isUrlDynamic = hasDynamicDateToken(url);
	const resolvedUrlPreview = isUrlDynamic
		? formatWeblinkDynamicText(url, now)
		: "";

	return (
		<Form
			id={id}
			className={`row g-3 ${className || ""}`}
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(e);
				e.target.reset();
			}}>
			<Form.Group className="col-auto">
				<Form.Label htmlFor="name">이름</Form.Label>
				<Form.Control
					ref={nameInputRef}
					type="text"
					id="name"
					maxLength={25}
					pattern="[A-Za-z0-9ㄱ-힣\{\}\(\)\[\]\-\_\.\,\!\?\+\&\/ ]{1,25}"
					required
					value={name}
					onFocus={() => setActiveField("name")}
					onChange={(e) => setName(e.target.value)}
				/>
			</Form.Group>
			<Form.Group className="col-auto">
				<Form.Label htmlFor="groupId">소속 그룹</Form.Label>
				<Form.Select
					id="groupId"
					value={groupId ?? ""}
					onChange={(e) => setGroupId(e.target.value)}
				>
					<option value="">미분류</option>
					{groups
						.filter((g) => g.id > 0)
						.map((g) => (
							<option key={g.id} value={g.id}>
								{g.name}
							</option>
						))}
				</Form.Select>
			</Form.Group>
			<Form.Group className="col-12">
				<Form.Label htmlFor="url">URL</Form.Label>
				<Form.Control
					ref={urlInputRef}
					type="text"
					inputMode="url"
					id="url"
					placeholder="https://example.com"
					pattern="https?://\S+"
					required
					value={url}
					onFocus={() => setActiveField("url")}
					onChange={(e) => setUrl(e.target.value)}
				/>
				<div
					className={`card border overflow-hidden mt-2 ${
						isFormatOpen ? "shadow-sm" : ""
					}`}
					style={{
						borderRadius: "8px",
						borderColor: isFormatOpen ? "#b6e0fe" : "#dee2e6",
						transition: "all 0.25s ease",
					}}
				>
					<div
						className="card-header d-flex justify-content-between align-items-center user-select-none"
						style={{
							cursor: "pointer",
							padding: "9px 14px",
							backgroundColor: isFormatOpen ? "#f0f7ff" : "#f1f3f5",
							borderBottom: isFormatOpen ? "1px solid #d0ebff" : "none",
							transition: "background-color 0.25s ease",
						}}
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => setIsFormatOpen((prev) => !prev)}
					>
						<span
							className={`fw-bold ${
								isFormatOpen ? "text-dark" : "text-secondary"
							}`}
							style={{ fontSize: "14px" }}
						>
							동적 날짜 포맷
						</span>
						<span
							style={{
								fontSize: "11px",
								display: "inline-block",
								transform: isFormatOpen ? "rotate(180deg)" : "rotate(0deg)",
								transition: "transform 0.25s ease",
								color: isFormatOpen ? "#0d6efd" : "#6c757d",
							}}
						>
							▼
						</span>
					</div>

					<div
						style={{
							maxHeight: isFormatOpen ? "200px" : "0px",
							opacity: isFormatOpen ? 1 : 0,
							transition:
								"max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
							overflow: "hidden",
							backgroundColor: "#ffffff",
						}}
					>
						<div
							className="px-3 d-flex flex-column"
							style={{ padding: "10px 14px", gap: "6px" }}
						>
							{WEBLINK_DATE_TOKEN_GROUPS.map(({ category, tokens }) => (
								<div
									key={category}
									className="d-flex align-items-center gap-2"
									style={{ margin: "1px 0" }}
								>
									<span
										className="text-secondary fw-semibold flex-shrink-0"
										style={{ fontSize: "14px", width: "38px" }}
									>
										{category}
									</span>
									<div
										className="d-flex flex-wrap"
										style={{ gap: "6px" }}
									>
										{tokens.map(({ token, getExample }) => {
											const exampleVal = getExample(now);
											return (
												<button
													key={token}
													type="button"
													className="btn btn-sm btn-light bg-white border text-dark d-inline-flex align-items-center gap-1 shadow-sm"
													style={{
														fontSize: "13.5px",
														height: "31px",
														padding: "0 10px",
													}}
													onMouseDown={(e) => e.preventDefault()}
													onClick={() => handleInsertToken(token)}
													title={`클릭 시 ${token} 삽입 (현재 값: ${exampleVal})`}
												>
													<code
														className="text-primary fw-bold"
														style={{ fontSize: "13.5px" }}
													>
														{token}
													</code>
													<span
														className="text-muted"
														style={{ fontSize: "13px" }}
													>
														({exampleVal})
													</span>
												</button>
											);
										})}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</Form.Group>
			<Col xs={12}>
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
				{isUrlDynamic && (
					<div
						className="mt-2 px-2.5 py-1.5 rounded-2 border bg-light"
						style={{
							fontSize: "13.5px",
							padding: "6px 10px",
							wordBreak: "break-all",
						}}
						title={resolvedUrlPreview}
					>
						<span className="text-secondary fw-semibold me-1">
							적용 URL:
						</span>
						<span className="text-primary">{resolvedUrlPreview}</span>
					</div>
				)}
			</Col>
		</Form>
	);
}
