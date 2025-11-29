import { gql } from '@apollo/client';

export const TOPICS_QUERY = gql`
  query Topics {
    topics {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

export const FLASHCARDS_BY_TOPIC_QUERY = gql`
  query FlashcardsByTopic($topicId: ID!) {
    flashcardsByTopic(topicId: $topicId) {
      id
      question
      answer
      createdAt
      updatedAt
      topic {
        id
      }
    }
  }
`;

export const CREATE_TOPIC_MUTATION = gql`
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_FLASHCARD_MUTATION = gql`
  mutation CreateFlashcard($input: CreateFlashcardInput!) {
    createFlashcard(input: $input) {
      id
      question
      answer
      createdAt
      updatedAt
      topic {
        id
      }
    }
  }
`;
