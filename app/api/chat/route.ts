import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { NextResponse } from "next/server";

export const runtime = 'edge';

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT!,
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY!),
  { apiVersion: "2024-02-15-preview" }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;
    console.log(message);
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const completion = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT_ID!,
      [
        {
          role: "system",
          content: "You are an expert interview coach. Help candidates prepare for interviews by providing concise, professional responses. Focus on common interview questions, best practices, and industry-specific guidance."
        },
        {
          role: "user",
          content: message
        }
      ],
      {
        temperature: 0.7,
        maxTokens: 800,
        topP: 0.95,
        frequencyPenalty: 0,
        presencePenalty: 0,
      }
    );

    const aiResponse = completion.choices[0].message?.content || 
      "I apologize, but I'm having trouble formulating a response.";

    return NextResponse.json({ response: aiResponse });

  } catch (error: any) {
    console.error('Azure OpenAI API Error:', error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}