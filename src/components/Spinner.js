import styled from "styled-components";

// https://gist.github.com/knowbody/578b35164b69e867ed4913423f6bed30
export default function Spinner({ size, color, width }) {
	return (
		<StyledSpinner viewBox="0 0 50 50" size={size} color={color}>
			<circle
				className="path"
				cx="25"
				cy="25"
				r="20"
				fill="none"
				strokeWidth={width || 4}
			/>
		</StyledSpinner>
	);
}

const StyledSpinner = styled.svg`
	animation: rotate 1s linear infinite;
	width: ${(props) => props.size || "50px"};
	height: ${(props) => props.size || "50px"};

	& .path {
		stroke: ${(props) => props.color || "#5652bf"};
		stroke-linecap: round;
		animation: dash 1.5s ease-in-out infinite;
	}

	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}
	@keyframes dash {
		0% {
			stroke-dasharray: 1, 150;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -35;
		}
		100% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -124;
		}
	}
`;
