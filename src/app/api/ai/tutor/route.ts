// src/app/api/ai/tutor/route.ts — AI Tutor Chat (Streaming)

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { tutorChat } from "@/services/ai.service";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages, sessionId, context } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Save user message to DB
    let chatSessionId = sessionId;
    const lastUserMsg = messages[messages.length - 1];

    if (!chatSessionId) {
      // Create new session
      const chatSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          title: lastUserMsg.content.slice(0, 80),
          context: context || null,
        },
      });
      chatSessionId = chatSession.id;
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSessionId,
        role: "user",
        content: lastUserMsg.content,
      },
    });

    // Stream response from OpenAI
    const stream = await tutorChat(messages, context);

    // Create a readable stream for the client
    const encoder = new TextEncoder();
    let fullContent = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullContent += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text, sessionId: chatSessionId })}\n\n`)
              );
            }
          }

          // Save assistant message to DB
          if (fullContent) {
            await prisma.chatMessage.create({
              data: {
                sessionId: chatSessionId,
                role: "assistant",
                content: fullContent,
              },
            });
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
  console.error("AI Tutor error:", error);

  const errorMessage =
    error instanceof Error ? error.message : "Failed";

  return new Response(JSON.stringify({ error: errorMessage }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
}