export function parseApiTextFromJson<T>(text: string): T | null {
  if (!text) return null;

  const rawJsonString = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(rawJsonString) as T;
  } catch (error) {
    console.error("Erro ao converter JSON:", error);
    return null;
  }
}
