# PDF Chat Application

This tool allows users to upload a PDF and interactively ask questions about its content. The app uses advanced AI and retrieval-augmented generation (RAG) techniques to provide accurate, context-aware answers directly from the uploaded document. This is ideal for quickly extracting information, summarizing content, or clarifying specific points from any PDF file.

# Explore More

- **Live Demo:** Experience the app live at [https://doc-chat-two.vercel.app](https://doc-chat-two.vercel.app)
- **Demo Video:** Watch a quick walkthrough at [here](https://drive.google.com/file/d/1bdZoQzQElzmMSx0KOpuzV12o-Gw-9xFi/view?usp=drive_link).
- **Article:** Read my concise guide on basic RAG for PDF chat at [Hashnode](https://satyajit-gen-ai.hashnode.dev/basic-rag-for-pdf-chat-short-and-crisp)

## Tech Stack Used
  - Next.js API Routes
  - LangChain (for document loading, splitting, embeddings, and vector store)
  - Qdrant (Vector Database)
  - Google Generative AI Embeddings
  - Groq LLM (for conversational AI)
  - Supabase Storage (for PDF file uploads and public URLs)
  - Clerk (Auth)

## Key Features

- **Upload PDF:** Drag-and-drop or select a PDF file to upload.
- **Ask Questions:** Chat interface to ask questions about the PDF.
- **AI-Powered Answers:** Uses RAG and LLMs to answer based only on the uploaded PDF content.
---