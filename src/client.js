import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

const link = createHttpLink({
	uri: process.env.REACT_APP_GRAPHQL_SERVER_URL,
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
