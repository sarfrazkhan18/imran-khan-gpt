export enum GeminiModel {
  FLASH_2_0 = "gemini-2.0-flash-exp",
  FLASH_1_5 = "gemini-1.5-flash"
}

export type ContentSource = "youtube" | "twitter" | "speech" | "interview" | "article";

export type IKContent = {
  id: string;
  title: string;
  url: string;
  date: string;
  source: ContentSource;
  content: string;
  length: number;
  tokens: number;
  chunks: IKChunk[];
  // Optional metadata
  video_id?: string;
  video_duration?: string;
  tweet_id?: string;
  location?: string;
  language?: "en" | "ur" | "mixed";
};

export type IKChunk = {
  id: string;
  content_id: string;
  content_title: string;
  content_url: string;
  content_date: string;
  content_source: ContentSource;
  content: string;
  content_length: number;
  content_tokens: number;
  embedding?: number[];
  chunk_index: number;
};

export type IKJSON = {
  current_date: string;
  author: string;
  url: string;
  length: number;
  tokens: number;
  contents: IKContent[];
};

export type SearchResult = {
  id: string;
  content_title: string;
  content_url: string;
  content_date: string;
  content_source: ContentSource;
  content: string;
  score: number;
};
