import { useState } from "react";
import { Badge, Button, Modal } from "react-bootstrap";

export default function FeatureHistoryModal() {
	const [show, setShow] = useState(false);

	const historyList = [
		{
			date: "2026.08",
			isNew: true,
			badge: "신규",
			title: "내 웹링크 순서 변경 (드래그 앤 드롭)",
			description:
				"내 웹링크 편집 화면에서 삼단줄(☰) 아이콘을 잡고 끌어서 웹링크 순서를 원하는 대로 자유롭게 정렬할 수 있습니다.",
		},
		{
			date: "2026",
			isNew: false,
			badge: "기능",
			title: "유튜브 연속 재생 플레이어",
			description:
				"유튜브 동영상 재생 목록을 구성하고 백그라운드에서 끊김 없이 연속 재생할 수 있습니다.",
		},
		{
			date: "2026",
			isNew: false,
			badge: "기능",
			title: "포털 통합 검색 (네이버 / 구글)",
			description:
				"네이버와 구글 검색 탭을 손쉽게 전환하며 원하는 포털 검색을 빠르게 이용할 수 있습니다.",
		},
		{
			date: "2026",
			isNew: false,
			badge: "기능",
			title: "나만의 웹링크 커스텀 등록",
			description:
				"자주 방문하는 웹사이트를 등록하고 이름, URL, 버튼 배경색 및 글자색을 자유롭게 스타일링할 수 있습니다.",
		},
		{
			date: "2026",
			isNew: false,
			badge: "기능",
			title: "자유 게시판 및 소통",
			description:
				"게시글 작성, 댓글 등록 및 좋아요 표시 기능으로 자유롭게 소통할 수 있습니다.",
		},
	];

	return (
		<>
			<button
				className="btn btn-light border d-flex align-items-center justify-content-center p-1 shadow-sm"
				style={{ width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer" }}
				onClick={() => setShow(true)}
				title="기능 추가 내역"
			>
				📋
			</button>

			<Modal show={show} onHide={() => setShow(false)} centered size="lg">
				<Modal.Header closeButton>
					<Modal.Title as="h5">기능 추가 내역</Modal.Title>
				</Modal.Header>
				<Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
					<div className="list-group list-group-flush">
						{historyList.map((item, index) => (
							<div key={index} className="list-group-item px-2 py-3">
								<div className="d-flex justify-content-between align-items-center mb-1">
									<div className="d-flex align-items-center gap-2">
										<Badge
											bg={item.isNew ? "primary" : "light"}
											text={item.isNew ? "white" : "dark"}
											className="px-2 py-1 me-2 border"
										>
											{item.badge}
										</Badge>
										<h6 className="mb-0 fw-bold">{item.title}</h6>
									</div>
									<small className="text-muted ms-2">{item.date}</small>
								</div>
								<p className="mb-0 text-secondary small mt-1" style={{ whiteSpace: "pre-line" }}>
									{item.description}
								</p>
							</div>
						))}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShow(false)}>
						닫기
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
