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
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Cloudinary par Upload
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });

    // 2. Database (Supabase) me Save
    const newPost = await prisma.post.create({
      data: {
        title: title || "Untitled File",
        description: description || "",
        fileUrl: uploadResult.secure_url,
      },
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
