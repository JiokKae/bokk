import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

const getGraphqlUri = () => {
	const defaultUri = process.env.REACT_APP_GRAPHQL_SERVER_URL;
	if (typeof window !== "undefined") {
		if (
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1"
		) {
			return "http://localhost/api/";
		}
	}
	return defaultUri;
};

const link = createHttpLink({
	uri: getGraphqlUri(),
	credentials: "include",
});

const client = new ApolloClient({
	cache: new InMemoryCache({
		typePolicies: {
			Weblink: {
				keyFields: ["id", "name"],
			},
			Message: {
				keyFields: ["id", "type"],
			},
			Writer: {
				keyFields: ["name", "type"],
			},
		},
	}),
	link,
});

export default client;
