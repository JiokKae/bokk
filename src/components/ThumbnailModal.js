export default function ThumbnailModal() {
	const onClick = () => {
		var formData = new FormData();
		formData.append(
			"address",
			document.getElementById("urlInput").value ?? ""
		);
		fetch("https://jiokkae.com/볶음밥/view/youtube_thumbnail.php", {
			method: "post",
			body: formData,
		})
			.then((res) => res.text())
			.then((txt) => {
				document.getElementById("thumbnail").innerHTML = txt;
				document.getElementById("urlInput").value = "";
			});
	};
	return (
		<div
			className="modal fade"
			id="thumbnailModal"
			tabIndex="-1"
			role="dialog"
			aria-labelledby="thumbnailModalLabel"
			aria-hidden="true">
			<div className="modal-dialog modal-lg" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title" id="thumbnailModalLabel">
							유튜브 Thumbnail 크게 보기
						</h5>
						<button
							type="button"
							className="btn-close"
							data-bs-dismiss="modal"
							aria-label="Close"></button>
					</div>
					<div id="thumbnail" className="modal-body">
						<img src="https://jiokkae.com/볶음밥/img/youtube_share_link.png" />
					</div>
					<div className="modal-footer">
						<div className="input-group mb-3">
							<input
								id="urlInput"
								type="text"
								className="form-control"
								placeholder="https://youtu.be/..."
								required
							/>
							<div className="input-group-append">
								<input
									onClick={onClick}
									type="button"
									className="btn btn-outline-secondary"
									value="입력"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
