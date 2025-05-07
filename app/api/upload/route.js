import { NextResponse } from "next/server";
// import { writeFile } from "fs/promises";
// import path from "path";
// import { mkdir } from "fs/promises";
import {RAG} from "@/utils/rag";
import { set } from "@/utils/store";
import { v4 as uuidv4 } from 'uuid'; 
import {supabaseUpload} from "@/utils/rag";


export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get("file");

    if(!file) {
        console.log("empty file");
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // const arrayBuffer = await file.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);
    // // Create uploads folder if it doesn't exist
    // const uploadDir = path.join(process.cwd(), "public", "uploads");
    // await mkdir(uploadDir, { recursive: true });
    // const filePath = path.join(uploadDir, file.name);
    // // Save the file
    // await writeFile(filePath, buffer);

    // const retriever = await RAG(file.name);
    const fileUrl = await supabaseUpload(file);
    console.log("********************************** fileUrl **********************************");
    console.log(fileUrl);
    // return;
    if(!fileUrl) {
        return NextResponse.json({ error: "error uploading file in storage." }, { status: 400 });
    }
    const retriever = await RAG(fileUrl);

    const sessionId = uuidv4();
    set(sessionId, retriever);

    // Return only the sessionId to the client
    return NextResponse.json({
        success: true,
        sessionId: sessionId,
        fileName: file.name
    });
}
