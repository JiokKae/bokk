function Writer({ name, type }) {
	return (
		<>
			{name}
			{type === "user" ? (
				<img
					className="m-1"
					src={`${process.env.REACT_APP_BOKK_IMG}/네모볶음밥32x32.png`}
					style={{ width: "16px" }}
					alt="회원"
				/>
			) : null}
		</>
	);
}
export default Writer;
