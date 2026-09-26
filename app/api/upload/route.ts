import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

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
    const blocksRaw = formData.get("blocks") as string;

    if (!title || !blocksRaw) {
      return NextResponse.json({ error: "Title and blocks are required" }, { status: 400 });
    }

    let blocks = JSON.parse(blocksRaw);

    for (let i = 0; i < blocks.length; i++) {
      const fileKey = `file_${i}`;
      const file = formData.get(fileKey) as File | null;

      // Only attempt Cloudinary upload if a real file is attached
      if (file && file.size > 0) {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
          throw new Error("Cloudinary Environment Variables are missing on Vercel");
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        blocks[i].content = uploadResult.secure_url;
      }
    }

    const post = await prisma.post.create({
      data: {
        title,
        blocks,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Upload Failed" }, { status: 500 });
  }
}
