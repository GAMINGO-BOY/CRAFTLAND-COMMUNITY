import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Add Comment or Reply
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postId, user, text, parentId } = body;

    const comment = await prisma.comment.create({
      data: {
        postId,
        user: user || "Public User",
        text,
        parentId: parentId || null,
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
