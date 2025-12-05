import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PackageData } from "../types";

// Initialize Gemini Client
// IMPORTANT: API Key is injected via process.env.API_KEY by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const packageSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    length: { type: Type.NUMBER, description: "Estimated length of the package in cm" },
    width: { type: Type.NUMBER, description: "Estimated width of the package in cm" },
    height: { type: Type.NUMBER, description: "Estimated height of the package in cm" },
    weight: { type: Type.NUMBER, description: "Estimated weight of the package in kg" },
    description: { type: Type.STRING, description: "Short visual description of the package content or box type" },
    confidence: { type: Type.NUMBER, description: "Confidence score of the estimation between 0 and 100" },
    shippingOptions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          carrier: { type: Type.STRING, description: "Name of the shipping carrier (e.g., DHL, FedEx, UPS)" },
          name: { type: Type.STRING, description: "Service name (e.g. Express, Standard)" },
          price: { type: Type.NUMBER, description: "Estimated cost in USD" },
          days: { type: Type.INTEGER, description: "Estimated delivery days" }
        }
      }
    }
  },
  required: ["length", "width", "height", "weight", "description", "shippingOptions"]
};

export const analyzePackageImage = async (base64Image: string): Promise<PackageData> => {
  try {
    // 1. Detect Mime Type dynamically
    // Default to jpeg if not found, but try to extract from data URL
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    // 2. Remove data URL prefix to get raw base64 string
    // robust regex to handle various image types
    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          {
            text: `Analyze this image of a package.
            1. Estimate the physical dimensions (length, width, height) in centimeters based on standard box sizes or visual reference.
            2. Estimate the weight in kg based on the likely contents and size.
            3. Provide a brief description.
            4. Generate 3 realistic shipping options with costs and delivery times.
            
            Return the result strictly as JSON matching the schema.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: packageSchema,
        temperature: 0.4, // Lower temperature for more consistent/realistic estimates
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data returned from AI");
    }

    return JSON.parse(text) as PackageData;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};