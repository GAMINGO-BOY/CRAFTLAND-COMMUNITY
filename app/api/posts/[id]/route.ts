import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Toggle Pin Status or Delete
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { isPinned } = await req.json();
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        isPinned,
        pinnedAt: isPinned ? new Date() : null,
      },
    });
    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
