import styled from "styled-components";

function Content({ usesTag, content, onClick }) {
	if (usesTag === true) {
		return (
			<ContentLayout
				dangerouslySetInnerHTML={{ __html: content }}
				onClick={onClick}></ContentLayout>
		);
	}
	return <ContentLayout onClick={onClick}>{content}</ContentLayout>;
}

export default Content;

const ContentLayout = styled.div`
	max-height: 600px;
	overflow: auto;
`;
