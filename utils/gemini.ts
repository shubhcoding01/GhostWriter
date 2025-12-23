import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ IMPORTANT: Replace this with your actual Gemini API Key
const API_KEY = "AIzaSyAhEeHNhBau8cLzrcvYslhis6VqSGyBhBk";

/**
 * Connects to Google Gemini to rewrite text.
 * @param roughNotes - The user's input text
 * @param style - The desired personality (e.g., "Professional", "Viral Tweet")
 * @param language - The target language (e.g., "English", "Hindi")
 * @returns The polished string, or NULL if offline/error.
 */
export async function fixTextWithAI(
  roughNotes: string, 
  style: string = "Professional", 
  language: string = "English"
) {
  // 1. Safety Check: Ensure API Key is present
  if (!API_KEY || API_KEY.includes("YOUR_GEMINI")) {
    console.error("Error: Missing API Key in utils/gemini.ts");
    return null; 
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Using flash model for speed and cost-efficiency
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Dynamic Style Instructions
    // This helps the AI understand exactly what "Viral Tweet" or "Witty" means
    let styleInstruction = "";
    switch (style) {
      case "Viral Tweet":
        styleInstruction = "Make it punchy, use lowercase, short sentences, and add 2-3 trending hashtags.";
        break;
      case "Poetic":
        styleInstruction = "Rewrite this as an elegant, rhythmic poem or haiku.";
        break;
      case "Witty":
        styleInstruction = "Make it clever, humorous, and slightly sarcastic.";
        break;
      case "ELI5":
        styleInstruction = "Explain it simply like I am a 5-year-old. Use simple analogies.";
        break;
      case "Professional":
      default:
        styleInstruction = "Make it clean, concise, corporate, and grammatically perfect.";
        break;
    }

    // 3. The Master Prompt
    const prompt = `
      Role: Expert Multilingual Editor & Ghostwriter.
      
      Task: Rewrite the input text following these strict rules:
      1. Style Goal: ${styleInstruction}
      2. Target Language: ${language} (Translate if necessary).
      3. Meaning: Keep the core meaning of the original text.
      
      Input Text: "${roughNotes}"
      
      Output: ONLY the rewritten text. Do not add conversational filler like "Here is your text".
    `;

    // 4. Timeout Logic (Offline Handler)
    // If AI takes longer than 10 seconds, we assume the user is offline
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout: Internet too slow")), 10000)
    );

    // Race the AI against the clock
    const result: any = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);

    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.log("Offline or AI Error:", error);
    return null; // Signals the UI to show the "Offline" alert
  }
}