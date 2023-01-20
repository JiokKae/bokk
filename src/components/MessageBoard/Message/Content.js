import styled from "styled-components";

function Content({ content, onClick }) {
	return (
		<ContentLayout
			dangerouslySetInnerHTML={{ __html: content }}
			onClick={onClick}></ContentLayout>
	);
}

export default Content;

const ContentLayout = styled.div`
	max-height: 600px;
	overflow: auto;
`;
