
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result as string;
            const base64Content = base64Data.split(",")[1];
            resolve({
                inlineData: {
                    data: base64Content,
                    mimeType: file.type,
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export interface AutofillData {
    title: string;
    description: string;
    category: string;
}

export async function generateItemDetails(imageFile: File): Promise<AutofillData | null> {
    if (!API_KEY) {
        throw new Error("Gemini API key is missing. Please check your configuration.");
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const imagePart = await fileToGenerativePart(imageFile);

        const prompt = `
      Analyze this image of a lost or found item.
      Provide a JSON response with the following fields:
      - title: A short, descriptive title (e.g., "Blue Nike Water Bottle").
      - description: A detailed description of the item including color, brand, distinct features, and condition if visible.
      - category: One of the following exact categories: "Electronics", "Clothing", "Books", "Accessories", "Sports Equipment", "Keys", "ID Cards", "Other".
      
      Respond ONLY with the JSON object. Do not format as markdown.
    `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean formatting if present (e.g. ```json ... ```)
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanedText) as AutofillData;
    } catch (error) {
        console.error("Error generating item details:", error);
        throw error;
    }
}
