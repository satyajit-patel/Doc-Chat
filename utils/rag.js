/*
    Loader
    Splitter
    Embedding model
    VectorDB
*/
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function RAG(fileName) {
    const filePath = "public/uploads/" + fileName;
    // console.log("*************************************************************************");
    // console.log(filePath);

    const loader = new PDFLoader(filePath, {splitPages: false});
    const docs = await loader.load();
    console.log("step 1 done");
    // console.log(docs[0].pageContent);

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
    });
    const documents = await textSplitter.createDocuments([docs[0].pageContent]);
    console.log("step 2 done");
    // console.log(documents[0].pageContent);

    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        apiKey: process.env.GOOGLE_API_KEY,
    });
    console.log("step 3 done");

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: "PDF-Chat",
    });
    await vectorStore.addDocuments(documents);
    const retriever = vectorStore.asRetriever({
        k: 2, // only top 2 relevent documents 
    });
    console.log("step 4 done");
    // const releventChunks = await retriever.invoke("what is the portfolio link of satyajit patel");
    // console.log(releventChunks);
    return retriever;
}

// RAG("cpHandBook.pdf");

export async function LLM(query, retriever) {
    const llm = new ChatGroq({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        apiKey: process.env.GROQ_API_KEY
    });
    const context = await retriever.invoke(query);

    const promptTemplate = ChatPromptTemplate.fromMessages([
        ["system", "you are a helpful AI asistant who responds only based on this context {context}"],
        ["user", "give a short and crisp answer of this query {query}"],
    ]);
    const prompt = await promptTemplate.invoke({context, query});
    // console.log("**************************************************");
    // console.log(prompt);
    // console.log("**************************************************");

    const aiMsg = await llm.invoke(prompt);
    
    return aiMsg.content;
}