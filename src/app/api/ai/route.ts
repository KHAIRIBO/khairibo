import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Log usage to Supabase (non-blocking)
    if (supabase) {
      supabase.from("ai_usage").insert({ message }).then(({ error }: any) => {
        if (error) console.error("Error logging AI usage:", error);
      });
    }

    if (!apiKey) {
      const lowerMsg = message.toLowerCase();
      
      // Local knowledge base for Khairi
      const knowledge: Record<string, string> = {
        "who": "I'm **Khairi Bouzakher**, a Senior Full Stack Developer and UI Designer driven by curiosity and built for performance!",
        "skill": "Khairi excels in **Next.js, React, Supabase, Tailwind CSS, and Framer Motion**. He's also an expert in UI/UX design.",
        "project": "Khairi has built several elite projects including this premium portfolio, complex dashboards, and AI-integrated apps. Check the **Projects** section for more!",
        "contact": "You can reach Khairi via the **Contact** section at the bottom of this page, or through his social links in the footer.",
        "experience": "Khairi has over **3 years of experience** in the tech industry, blending clean design with robust engineering.",
        "education": "Khairi is currently a **Computer Science student**, constantly learning and adapting to new technologies.",
        "stack": "His favorite tech stack includes **Next.js 15, TypeScript, Supabase, and Tailwind CSS**.",
        "logo": "The KBO logo represents Khairi's commitment to quality and innovation in every line of code.",
        "hello": "Hii! I'm KBO AI. I can tell you all about Khairi's skills, projects, and experience. What would you like to know?",
        "hi": "Hii! I'm KBO AI. I can tell you all about Khairi's skills, projects, and experience. What would you like to know?"
      };

      // Simple keyword matching
      let response = "I'm sorry, I only know about Khairi's professional background for now. Try asking about his **skills, projects, or experience**!";
      
      for (const [key, val] of Object.entries(knowledge)) {
        if (lowerMsg.includes(key)) {
          response = val;
          break;
        }
      }

      return new Response(response);
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
            Information about Khairi:
            - Full Name: Khairi Bouzakher.
            - Role: Senior Full Stack Developer & UI Designer.
            - Education: Computer Science student.
            - Experience: 3+ years in the tech industry.
            - Focus: Building highly interactive, accessible, and performant web applications.
            - Specialties: Clean code, maintainable architecture, fast learning, and creative problem solving.
            - Tech Stack: Next.js, React, Supabase, Tailwind CSS, Framer Motion, and UI/UX design.
            - Personality: Professional, sophisticated, helpful, and innovative.
            
            Guidelines:
            - Respond as Khairi's digital twin or personal assistant.
            - Use Markdown for formatting (bolding, lists, etc.).
            - Be concise but highly accurate.
            - If asked something you don't know about Khairi, be honest but stay in character.`
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
