import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistCache, AsyncStorageWrapper } from 'apollo3-cache-persist';
import { API_URL } from '@/constants/api';

let clientPromise: Promise<ApolloClient<NormalizedCacheObject>> | null = null;

async function createClient() {
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          topics: {
            merge: (_existing, incoming) => incoming
          },
          flashcards: {
            keyArgs: ['topicId'],
            merge: (_existing, incoming) => incoming
          }
        }
      },
      Topic: {
        keyFields: ['id']
      },
      Flashcard: {
        keyFields: ['id']
      }
    }
  });

  await persistCache({
    cache,
    storage: new AsyncStorageWrapper(AsyncStorage)
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach((error) => {
        console.warn('[GraphQL error]', error.message);
      });
    }
    if (networkError) {
      console.warn('[Network error]', networkError);
    }
  });

  const httpLink = new HttpLink({ uri: API_URL });

  const link = ApolloLink.from([errorLink, httpLink]);

  return new ApolloClient({
    link,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network'
      },
      query: {
        fetchPolicy: 'network-only'
      }
    }
  });
}

export async function getApolloClient() {
  if (!clientPromise) {
    clientPromise = createClient();
  }
  return clientPromise;
}
