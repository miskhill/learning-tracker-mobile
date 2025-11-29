export interface Topic {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Flashcard {
  id: string;
  topicId: string;
  question: string;
  answer: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  topic?: {
    id: string;
    name?: string | null;
    description?: string | null;
  } | null;
}

export interface CreateTopicInput {
  name: string;
  description?: string | null;
}

export interface CreateFlashcardInput {
  topicId: string;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
}
