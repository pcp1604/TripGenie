
import { GoogleGenAI } from "@google/genai";
import { TripItinerary, MustVisitPlace, TransportMode } from "../types";

// In a real production app, these API calls would be proxied through a backend (Node.js/Next.js API routes)
// to keep the API Key secure. For this web container demo, we run it client-side.

let aiClient: GoogleGenAI | null = null;

export const initializeGemini = (apiKey: string) => {
  aiClient = new GoogleGenAI({ apiKey });
};

export const isGeminiInitialized = () => !!aiClient;

const getClient = () => {
  if (!aiClient) {
    const storedKey = localStorage.getItem('tripgenie_api_key');
    if (storedKey) {
      aiClient = new GoogleGenAI({ apiKey: storedKey });
    } else {
      throw new Error("API Key missing");
    }
  }
  return aiClient!;
};

// --- System Prompts ---

const ITINERARY_SYSTEM_PROMPT = `
You are TripGenie, an expert, tasteful, and budget-conscious travel planner specialized in Indian and International travel.
Your goal is to convert user natural language requests into structured JSON travel itineraries.

RULES:
1. **JSON ONLY**: Your output must be PURE JSON. Do not wrap in markdown blocks like \`\`\`json.
2. **Realism**: Provide realistic travel times, logic sequences (breakfast -> activity -> lunch), and real POIs.
3. **Budget & Currency**: 
   - ALL financial estimates must be in **Indian Rupees (₹/INR)**. 
   - Respect the user's budget. If it's tight, suggest free activities and budget stays.
4. **Structure**: Follow the exact JSON schema provided below.
5. **Safety**: Include specific safety notes for the location.
6. **Visa**: Provide high-level visa guidance based on the origin (assume User is from India unless stated otherwise).

SCHEMA:
{
  "destination": "City, Country",
  "summary": "A 1-sentence elegant summary.",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "travelers": 2,
  "costs": { "flights": 0, "hotels": 0, "transport": 0, "activities": 0, "food": 0, "total": 0 },
  "visaGuidance": { "required": boolean, "summary": "string", "officialLink": "string" },
  "packingList": ["string"],
  "safetyNotes": "string",
  "flights": [
     { "id": "f1", "airline": "Airline/Train/Bus Name", "flightNumber": "XX123", "departureTime": "HH:MM", "arrivalTime": "HH:MM", "price": 5000, "duration": "3h", "stops": 0, "bookingLink": "https://google.com" }
  ],
  "hotels": [
     { "id": "h1", "name": "Hotel Name", "stars": 4, "location": "Area", "pricePerNight": 4000, "totalPrice": 12000, "amenities": ["WiFi", "Pool"], "bookingLink": "https://booking.com" }
  ],
  "days": [
    {
      "day": 1,
      "theme": "Arrival & Exploration",
      "dailyTotalEstimate": 3000,
      "activities": [
        {
          "id": "a1", "time": "09:00", "title": "Activity Name", "description": "What to do there", "duration": "2h", "type": "culture", "location": "Address", "cost": 500
        }
      ]
    }
  ]
}
`;

export const generateTripPlan = async (userRequest: string, transportMode: TransportMode): Promise<TripItinerary> => {
  const client = getClient();
  
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User Request: "${userRequest}". 
      
      MANDATORY REQUIREMENT: The user has selected to travel by **${transportMode.toUpperCase()}**. 
      1. Ensure the "flights" array in the JSON contains options relevant to ${transportMode} (e.g., if Train, list Train Name/Number; if Car, list Route details).
      2. Ensure the itinerary reflects this mode of arrival.
      3. All costs must be in Indian Rupees (INR).
      
      Generate a detailed itinerary based on this request. 
      If specific dates aren't given, assume next month.
      If budget isn't given, assume moderate.
      Populate specific real hotels and transport options with estimated current market prices in INR.`,
      config: {
        systemInstruction: ITINERARY_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.4, // Lower temperature for more grounded/structured results
      }
    });

    const text = response.text || "{}";
    // Clean up if the model still adds markdown
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);
    
    // Enforce ID injection if missing
    data.id = crypto.randomUUID();
    return data as TripItinerary;

  } catch (error) {
    console.error("Trip Generation Error:", error);
    throw new Error("Failed to generate trip. Please try again or check your API key.");
  }
};

export const getMustVisitRecommendation = async (destination: string, tripSummary: string): Promise<MustVisitPlace> => {
  const client = getClient();
  
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Destination: ${destination}
        Trip Summary/Context: ${tripSummary}
        
        Identify exactly ONE "Unmissable Hidden Gem" or "Must-Visit Highlight" for this specific trip. 
        It should be specific and tailored to the vibe of the trip summary. 
        Ideally something slightly less generic than the #1 tourist trap, but still iconic.
        
        Return strictly JSON matching this schema:
        {
          "name": "Place Name",
          "description": "Evocative description (max 2 sentences)",
          "reason": "Why this specific traveler must see it",
          "bestTime": "Specific time (e.g. 'Sunset' or 'Early morning')",
          "tip": "A practical insider tip"
        }
      `,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      }
    });

    const text = response.text || "{}";
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr) as MustVisitPlace;

  } catch (error) {
    console.error("Must Visit Error:", error);
    throw new Error("Could not fetch recommendation.");
  }
};

export const streamStrategyGeneration = async (context: string, prompt: string, onChunk: (text: string) => void) => {
  const client = getClient();
  try {
    const response = await client.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: `Project Context: ${context}\n\nStrategy Requirement: ${prompt}\n\nProvide a detailed strategy document in Markdown format.`,
    });

    for await (const chunk of response) {
      const text = chunk.text();
      if (text) {
        onChunk(text);
      }
    }
  } catch (error) {
    console.error("Strategy Stream Error:", error);
    throw error;
  }
};

export const sendChatMessage = async (history: any[], message: string, context: string, onChunk: (text: string) => void) => {
    const client = getClient();
    try {
        const chat = client.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a senior strategy consultant AI assistant. You are helping with a project.
                
                Project Context:
                ${context}
                
                Answer questions based on this context and your general knowledge.`,
            },
            history: history
        });

        const result = await chat.sendMessageStream({ message });
        
        for await (const chunk of result) {
            const text = chunk.text();
            if (text) {
                onChunk(text);
            }
        }
    } catch (error) {
        console.error("Chat Stream Error:", error);
        throw error;
    }
};

export const analyzeData = async (data: any) => {
  // Placeholder implementation as specific analysis logic wasn't defined
  return "Analysis functionality coming soon.";
};
