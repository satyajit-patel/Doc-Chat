# PDF Chat Application

A sleek Next.js application that lets you upload a PDF and chat with its content using a Retrieval-Augmented Generation (RAG) pipeline powered by LangChain, Qdrant, and Google Generative AI embeddings.

## Features

- Upload PDF files
- Split and embed PDF text for vector search
- Chat interface to ask questions about your PDF

# Explore More
  
<!-- - **Live Demo:** Experience the app live at [doc-chat-mu.vercel.app](https://doc-chat-mu.vercel.app).   -->
- **Demo Video:** Watch a quick walkthrough at [here](https://drive.google.com/file/d/1bdZoQzQElzmMSx0KOpuzV12o-Gw-9xFi/view?usp=drive_link).
- **Article:** Read my concise guide on basic RAG for PDF chat at [Hashnode](https://satyajit-gen-ai.hashnode.dev/basic-rag-for-pdf-chat-short-and-crisp)

### Run This Project Locally
1. Clone the repository
```
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```
2. Install dependencies
```
npm install
```
3. Create .env.local
Create a .env.local file in the root directory and add any required environment variables.
```
NEXT_PUBLIC_HOST="http://localhost:3000"
GOOGLE_API_KEY=<yourKey>
QDRANT_API_KEY=<yourKey>
QDRANT_URL=<yourKey>
GROQ_API_KEY=<yourKey>
```

4. Run the App
```
npm run dev
```
Your app will be available at http://localhost:3000
