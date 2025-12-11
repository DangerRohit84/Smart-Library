import { GoogleGenAI } from "@google/genai";
import { LIBRARY_RULES } from "../types";

const SYSTEM_INSTRUCTION = `
You are the "LibBook AI Librarian", a helpful and polite assistant for a university library seat booking system.
Your goal is to assist students with:
1. Understanding library rules.
2. Explaining how to book seats.
3. General study tips or library etiquette.

Here are the specific Library Rules you must know:
${LIBRARY_RULES}

If a student asks about their specific booking status or personal data, politely explain that you are an AI assistant and cannot access their private real-time account data directly for security reasons, but guide them to the "My Bookings" tab.

Keep responses concise, encouraging, and academic.
`;

export const chatWithLibrarian = async (
  message: string, 
  history: { role: 'user' | 'model', text: string }[] = []
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "I'm currently offline (API Key missing). Please check the system configuration.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Convert history format if needed, but for simple single-turn or short context we can just use chat
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to the library network right now. Please try again later.";
  }
};
