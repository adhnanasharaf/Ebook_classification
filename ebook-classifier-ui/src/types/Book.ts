export interface Book {
    id: string;
    title: string;
    author: string;
    excerpt: string;
    tags: string[];
    filePath?: string;  // for when we implement local file reading
    processed?: boolean; // to track if LLM has processed this book
  }