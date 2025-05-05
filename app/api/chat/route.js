import { NextResponse } from "next/server";
import { LLM } from "@/utils/rag";
import { get } from "@/utils/store";

export async function POST(request) {
    const { query, sessionId } = await request.json();
    
    // Get the retriever from the server-side store
    const retriever = get(sessionId);
    
    if (!retriever) {
        return NextResponse.json({
            error: "Session expired or invalid. Please upload your PDF again."
        }, { status: 400 });
    }

    try {
        const aiMsg = await LLM(query, retriever);
        console.log("**************** aiMsg *********************************");
        console.log(aiMsg);
        return NextResponse.json({ response: aiMsg });
    } catch (error) {
        console.error("Error processing query:", error);
        return NextResponse.json({
            error: "Failed to process your question"
        }, { status: 500 });
    }
}