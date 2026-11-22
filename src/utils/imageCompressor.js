export function calculateResizedDimensions(width, height, maxDimension) {
	if (width <= maxDimension && height <= maxDimension) {
		return { width, height };
	}
	if (width > height) {
		return {
			width: maxDimension,
			height: Math.round((height * maxDimension) / width),
		};
	}
	return {
		width: Math.round((width * maxDimension) / height),
		height: maxDimension,
	};
}

export function convertYoutubeIframesToOembed(rawHtml) {
	if (!rawHtml || !rawHtml.includes("<iframe")) {
		return rawHtml;
	}
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = rawHtml;
	const iframes = tempDiv.querySelectorAll("iframe");
	iframes.forEach((iframe) => {
		const src = iframe.getAttribute("src");
		if (src && src.includes("youtube.com/embed/")) {
			const match = src.match(/embed\/([^?]+)/);
			if (match) {
				const videoId = match[1];
				const oembed = document.createElement("oembed");
				oembed.setAttribute(
					"url",
					`https://www.youtube.com/watch?v=${videoId}`
				);
				// iframe만 oembed로 교체하고, 바깥을 감싸고 있는 div.ratio 껍데기는 유지하여 줄바꿈(Block) 특성을 보존합니다.
				iframe.replaceWith(oembed);
			}
		}
	});
	return tempDiv.innerHTML;
}

export async function processAndCompressImage(
	file,
	maxDimension = 1920,
	quality = 0.85
) {
	if (!file || !(file instanceof Blob)) {
		throw new Error("유효한 파일이 아닙니다.");
	}

	if (file.size > 15 * 1024 * 1024) {
		throw new Error("이미지 파일 크기는 최대 15MB까지 업로드 가능합니다.");
	}

	const isGif = file.type === "image/gif" || /\.gif$/i.test(file.name || "");
	const isWebp = file.type === "image/webp" || /\.webp$/i.test(file.name || "");

	if (isGif || isWebp) {
		const mimeType = isGif ? "image/gif" : "image/webp";
		const defaultExt = isGif ? ".gif" : ".webp";
		let fileName = file.name || `upload${defaultExt}`;
		if (isWebp && !/\.webp$/i.test(fileName)) fileName += ".webp";
		if (isGif && !/\.gif$/i.test(fileName)) fileName += ".gif";

		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const blob = new Blob([e.target.result], { type: mimeType });
				resolve(new File([blob], fileName, { type: mimeType }));
			};
			reader.onerror = () => resolve(file);
			reader.readAsArrayBuffer(file);
		});
	}

	// Try createImageBitmap with EXIF orientation auto-rotation (Fixes mobile vertical photo 90deg rotation!)
	try {
		const imgBitmap = await createImageBitmap(file, {
			imageOrientation: "from-image",
		});
		const { width, height } = calculateResizedDimensions(
			imgBitmap.width,
			imgBitmap.height,
			maxDimension
		);

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext("2d");
		ctx.drawImage(imgBitmap, 0, 0, width, height);

		// 모바일 기기에서 연속 업로드 시 메모리 부족(OOM) 방지를 위해 메모리 즉시 해제
		if (imgBitmap.close) imgBitmap.close();

		return new Promise((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (!blob) return reject("이미지 변환 실패");
					const newFileName = file.name
						? file.name.replace(/\.[^/.]+$/, ".jpg")
						: "upload.jpg";
					resolve(new File([blob], newFileName, { type: "image/jpeg" }));
				},
				"image/jpeg",
				quality
			);
		});
	} catch (e) {
		// Fallback to FileReader if createImageBitmap fails
		return new Promise((resolve, reject) => {
			if (file.type === "image/heic" || file.type === "image/heif") {
				return reject(
					"HEIC(애플 고효율 이미지) 형식은 지원하지 않습니다. 일반 JPG로 변환하여 업로드해주세요."
				);
			}
			const reader = new FileReader();
			reader.onload = (evt) => {
				const img = new Image();
				img.onload = () => {
					const { width, height } = calculateResizedDimensions(
						img.width,
						img.height,
						maxDimension
					);
					const canvas = document.createElement("canvas");
					canvas.width = width;
					canvas.height = height;
					const ctx = canvas.getContext("2d");
					ctx.drawImage(img, 0, 0, width, height);
					canvas.toBlob(
						(blob) => {
							if (!blob) return resolve(file);
							const newFileName = file.name
								? file.name.replace(/\.[^/.]+$/, ".jpg")
								: "upload.jpg";
							resolve(new File([blob], newFileName, { type: "image/jpeg" }));
						},
						"image/jpeg",
						quality
					);
				};
				img.onerror = () => resolve(file);
				img.src = evt.target.result;
			};
			reader.onerror = () => resolve(file);
			reader.readAsDataURL(file);
		});
	}
}

export async function uploadImageFile(file) {
	const processedFile = await processAndCompressImage(file, 1080, 0.8);
	const formData = new FormData();
	formData.append("upload", processedFile);

	const uploadEndpoint = `${process.env.REACT_APP_GRAPHQL_SERVER_URL}upload.php`;

	const response = await fetch(uploadEndpoint, {
		method: "POST",
		body: formData,
	});
	const data = await response.json();
	if (data && data.url) {
		return data.url;
	}
	throw new Error(data?.error?.message || "이미지 업로드에 실패했습니다.");
}
