import { useEffect } from "react";

/**
 * Bootstrap Offcanvas 위에서 모달이 열릴 때 오프캔버스의 포커스 트랩을 일시 해제하여
 * 모달 내부 입력창에 정상적으로 포커스가 가능하도록 처리합니다.
 */
export default function useOffcanvasFocusTrapBypass(
	show,
	offcanvasId = "offcanvasYoutubeQueue"
) {
	useEffect(() => {
		if (!show) return;

		const offcanvasElem = document.getElementById(offcanvasId);
		let bsOffcanvas = null;
		if (window.bootstrap?.Offcanvas && offcanvasElem) {
			bsOffcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasElem);
			if (bsOffcanvas?._focustrap) {
				bsOffcanvas._focustrap.deactivate();
			}
		}

		return () => {
			if (bsOffcanvas?._focustrap && bsOffcanvas._isShown) {
				bsOffcanvas._focustrap.activate();
			}
		};
	}, [show, offcanvasId]);
}
