interface Part {
  text: string;
}

interface Content {
  parts: Part[];
}

interface Candidate {
  content: Content;
}

export interface IApiGeminiResponse {
  candidates: Candidate[];
}
