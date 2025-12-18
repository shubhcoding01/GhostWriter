// import { GoogleGenerativeAI } from "@google/generative-ai";

// // ⚠️ IMPORTANT: Replace this with your actual Gemini API Key
// const API_KEY = "YOUR_GEMINI_API_KEY_HERE";

// export async function fixTextWithAI(roughNotes: string) {
//   if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
//     return "Error: Please add your API Key in utils/gemini.ts";
//   }

//   try {
//     const genAI = new GoogleGenerativeAI(API_KEY);
//     // Using flash model for speed
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const prompt = `
//       You are an expert Ghostwriter.
//       Task: Rewrite the following rough notes into a clear, professional, and concise paragraph.
//       Maintain the original meaning but fix grammar and flow.
      
//       Rough Notes: "${roughNotes}"
      
//       Output only the polished text. No conversational filler.
//     `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     return response.text();
    
//   } catch (error) {
//     console.error("AI Error:", error);
//     return "Error: Could not connect to AI. Check internet or API Key.";
//   }
// }

import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ Replace with your actual Gemini API Key
const API_KEY = "YOUR_GEMINI_API_KEY_HERE";

export async function fixTextWithAI(roughNotes: string) {
  if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    return null; // Signal that key is missing
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert Ghostwriter.
      Rewrite this text to be professional and concise.
      Text: "${roughNotes}"
      Output only the polished text.
    `;

    // Set a timeout so the app doesn't freeze if internet is slow
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 10000)
    );

    const result: any = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);

    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.log("Offline or Error:", error);
    return null; // Return null to signal failure (Offline)
  }
}