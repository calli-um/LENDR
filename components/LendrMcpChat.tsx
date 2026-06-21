"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
  loading?: boolean;
};

type Listing = {
  title?: string;
  name?: string;
  price?: number | string;
};

export default function LendrMcpChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello! I can help you find listings.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);


  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userInput = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userInput,
      },
    ]);

    setInput("");
    setLoading(true);


    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: "Calling MCP tool: get_listings...",
        loading: true,
      },
    ]);


    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: "get_listings",
          arguments: {
            keyword: userInput,
          },
        }),
      });


      if (!res.ok) {
        throw new Error("MCP failed");
      }


      const data = await res.json();


      const rawText =
        data?.content?.[0]?.text ?? "[]";


      let listings: Listing[] = [];


      try {
        listings = JSON.parse(rawText);
      } catch {
        listings = [];
      }


      let responseText = "";


      if (!listings.length) {
        responseText = "No listings found.";
      } 
      else {

        responseText = listings
          .map(
            (item) =>
              `📦 ${item.title || item.name} — PKR ${
                item.price ?? "N/A"
              }`
          )
          .join("\n");

      }


      setMessages((prev) =>
        prev.map((msg) =>
          msg.loading
            ? {
                role: "assistant",
                text: responseText,
              }
            : msg
        )
      );


    } catch (error) {


      setMessages((prev) =>
        prev.map((msg) =>
          msg.loading
            ? {
                role: "assistant",
                text: "Error calling MCP server",
              }
            : msg
        )
      );


    } finally {

      setLoading(false);

    }
  }


  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();

      sendMessage();

    }

  }


  return (

    <div className="flex h-screen flex-col bg-gray-100">


      {/* Header */}

      <div className="border-b bg-white p-4 text-center">

        <h1 className="text-xl font-semibold">
          LENDR MCP Demo
        </h1>

      </div>



      {/* Messages */}

      <div className="flex-1 overflow-y-auto p-5">


        {messages.map((msg, index) => (

          <div
            key={index}
            className={`mb-4 flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >


            <div
              className={`max-w-[75%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm shadow-sm transition-all

              ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 border rounded-bl-none"
              }

              `}
            >


              {msg.loading ? (

                <span>

                  Thinking
                  
                  <span className="animate-pulse">
                    ...
                  </span>

                </span>


              ) : (

                msg.text

              )}


            </div>


          </div>


        ))}


        <div ref={bottomRef} />


      </div>





      {/* Input */}

      <div className="flex gap-3 border-t bg-white p-4">


        <textarea
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search listings..."
          rows={1}
          className="
          flex-1
          resize-none
          rounded-xl
          border
          px-4
          py-3
          outline-none
          focus:ring-2
          focus:ring-blue-500
          "
        />


        <button

          onClick={sendMessage}

          disabled={loading}

          className="
          rounded-xl
          bg-black
          px-6
          text-white
          disabled:opacity-50
          "

        >

          {loading ? "..." : "Send"}

        </button>


      </div>



    </div>

  );

}