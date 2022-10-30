import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
	uri: "https://jiokkae.com/api/",
	cache: new InMemoryCache(),
});

export default client;
