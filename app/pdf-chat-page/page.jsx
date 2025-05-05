"use client";
import React, { useState, useRef } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import Link from "next/link";

export default function PDFChatApplication() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  // Reference to the chat container for scrolling to bottom
  const chatContainerRef = useRef(null);

  const handleFileUpload = async (selectedFiles) => {
    // Reset states
    setError("");
    setIsFileUploaded(false);
    setMessages([]);

    if(!selectedFiles || selectedFiles.length === 0) {
      setError("No file selected.");
      return;
    }

    const file = selectedFiles[0];

    // Check MIME type
    if(file.type !== "application/pdf") {
      setError("Please upload only PDF files.");
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/upload`, {
        method: "POST",
        body: formData
      });
      
      if(!response.ok) {
        throw new Error("Upload failed");
      }
      
      const result = await response.json();
      setSessionId(result.sessionId);
      
      setFiles([file]);
      setIsFileUploaded(true);
      
      // Add a system message to indicate successful upload
      setMessages([{
        role: "system",
        content: `PDF "${file.name}" uploaded successfully. You can now ask questions about it!`
      }]);
      
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !isFileUploaded) return;
    
    // Add user message to chat
    const userMessage = { role: "user", content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input field
    setInputMessage("");
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Send query to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage.content,
          sessionId: sessionId
        }),
      });
      
      if(!response.ok) {
        throw new Error("Failed to get response");
      }
      
      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.response || "Sorry, I couldn't find an answer to that question."
      }]);
      
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, there was an error processing your question. Please try again."
      }]);
    } finally {
      setIsLoading(false);
      
      // Scroll to bottom of chat
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  return (
    <>
    <Link href="/landing-page">
        <button
        className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm m-1">
            Home
        </button>
    </Link>

    <div className="flex flex-col w-full max-w-5xl mx-auto min-h-screen p-4 space-y-6">
      {/* File Upload Section */}
      <div className="w-full border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Upload Your PDF</h2>
        <FileUpload onChange={handleFileUpload} />

        {error && (
          <p className="mt-2 text-red-500">
            {error}
          </p>
        )}

        {files.length > 0 && !error && (
          <p className="mt-2 text-green-500">
            Uploaded file: <strong>{files[0].name}</strong>
          </p>
        )}
        
        {isLoading && !isFileUploaded && (
          <p className="mt-2 text-blue-500">
            Processing your PDF... This may take a moment.
          </p>
        )}
      </div>
      
      {/* Chat Interface */}
      <div className={`flex-1 flex flex-col border rounded-lg overflow-hidden ${isFileUploaded ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <h2 className="text-xl font-semibold p-4 border-b">Chat with your PDF</h2>
        
        {/* Messages Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 p-4 overflow-y-auto space-y-4"
          style={{ minHeight: "400px", maxHeight: "60vh" }}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              {isFileUploaded ? "Ask a question about your PDF" : "Upload a PDF to start chatting"}
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.role === "user" 
                    ? "bg-blue-100 dark:bg-blue-900 ml-auto" 
                    : msg.role === "system"
                    ? "bg-gray-100 dark:bg-gray-800 mx-auto text-center"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {msg.content}
              </div>
            ))
          )}
          
          {isLoading && isFileUploaded && (
            <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-gray-600 dark:bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          )}
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isFileUploaded ? "Ask something about your PDF..." : "Upload a PDF first"}
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isFileUploaded || isLoading}
          />
          <button
            type="submit"
            disabled={!isFileUploaded || isLoading || !inputMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
    </>
  );
}