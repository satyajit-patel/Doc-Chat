/*
    Loader
    Splitter
    Embedding model
    VectorDB
*/
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import supabase from "@/supabase";
import "@mendable/firecrawl-js";
// import { FireCrawlLoader } from "@langchain/community/document_loaders/web/firecrawl";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

// export async function firecrawl(fileUrl) {
//     const loader = new FireCrawlLoader({
//         url: fileUrl,
//         apiKey: process.env.FIRECRAWL_API_KEY, 
//         mode: "scrape", // "scrape" for single urls or "crawl" for all accessible subpages
//         params: {
//           formats: ['markdown'],
//         },
//     });
//     const docs = await loader.load();
//     console.log(typeof(docs[0].pageContent));
//     console.log(docs[0].pageContent);
// }

export async function RAG(fileUrl) {
    // const loader = new PDFLoader(fileUrl, {splitPages: false});
    // const docs = await loader.load();
    // console.log(docs[0].pageContent);
    // console.log("step 1 done");

   
    // Fetch the PDF file from the URL
    const response = await fetch(fileUrl);
    // Convert response to Blob
    const pdfBlob = await response.blob();
    // Create loader with the Blob
    const loader = new WebPDFLoader(pdfBlob, { splitPages: false });
    // Load documents
    const docs = await loader.load();
    console.log({ docs });
    console.log("step 1 done");

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

export async function supabaseUpload(file) {
    const {error} = await supabase.storage.from('pdf-store').upload(file.name, file, {
        upsert: true, // enables Overwriting
    });
    if(error) {
        console.log("error uploading file", error.message);
        return;
    }
    const {data} = await supabase.storage.from('pdf-store').getPublicUrl(file.name);
    // console.log(data);
    return data.publicUrl;
}