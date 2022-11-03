import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

const link = createHttpLink({
	uri: "https://jiokkae.com/api/",
	credentials: "include",
});

const client = new ApolloClient({
	cache: new InMemoryCache(),
	cache: new InMemoryCache({
		typePolicies: {
			Weblink: {
				keyFields: ["id", "name"],
			},
		},
	}),
	link,
});

export default client;
