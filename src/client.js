import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { API } from "./constants/urls";

const link = createHttpLink({
	uri: `${API}/`,
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
