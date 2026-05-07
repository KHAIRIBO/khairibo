import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Log usage to Supabase (non-blocking)
    supabase.from("ai_usage").insert({ message }).then(({ error }) => {
      if (error) console.error("Error logging AI usage:", error);
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    // Using fetch directly as it's more reliable for streaming in Next.js
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        messages: [
          {
            role: "system",
            content: `You are "KBO AI", the elite personal assistant of Khairi Bouzakher. 
            Khairi is a Senior Full Stack Developer & UI Designer.
            Guidelines:
            - Be helpful, professional, and sophisticated.
            - Use Markdown for formatting.
            - Highlight skills in Next.js, React, Supabase, and UI/UX design.
            - Provide highly accurate and reasoned answers.`
          },
          ...history.map((msg: any) => ({
            role: msg.role === "ai" ? "assistant" : "user",
            content: msg.text,
          })),
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "AI Service Error");
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataStr = line.slice(6).trim();
                if (dataStr === "[DONE]") {
                  controller.close();
                  return;
                }

                try {
                  const data = JSON.parse(dataStr);
                  const content = data.choices[0]?.delta?.content || "";
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Ignore partial JSON
                }
              }
            }
          }
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream);
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
