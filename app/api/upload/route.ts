import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const blocksJson = formData.get("blocks") as string;
    let blocks = JSON.parse(blocksJson || "[]");

    // Process all media files present in blocks
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (["image", "video", "audio"].includes(block.type) && formData.has(`file_${i}`)) {
        const file = formData.get(`file_${i}`) as File;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload media file to Cloudinary
        const uploadResult: any = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        // Replace raw file reference with Cloudinary secure URL
        block.content = uploadResult.secure_url;
      }
    }

    // Save to Supabase via Prisma
    const newPost = await prisma.post.create({
      data: {
        title: title || "Untitled Post",
        blocks: blocks,
      },
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Post creation failed" }, { status: 500 });
  }
}
