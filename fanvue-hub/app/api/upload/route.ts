import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const ext = path.extname(file.name) || ".wav";
        const filename = `${uuidv4()}${ext}`;
        const filepath = path.join(uploadDir, filename);

        fs.writeFileSync(filepath, buffer);

        // Return both web URL and absolute filesystem path
        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`,
            filepath: filepath,
            originalName: file.name
        });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
