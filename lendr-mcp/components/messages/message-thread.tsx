"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/lib/actions/messages";
import { formatDate } from "@/lib/utils";
import type { Message, Profile } from "@/types/database";

type MessageWithSender = Message & { sender: Profile | null };

export function MessageThread({
  bookingId,
  initialMessages,
  currentUserId,
}: {
  bookingId: string;
  initialMessages: MessageWithSender[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          const { data: sender } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newMsg.sender_id)
            .single();

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, { ...newMsg, sender }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, supabase]);

  async function handleSubmit(formData: FormData) {
    const body = formData.get("body")?.toString() ?? "";
    if (!body.trim()) return;

    formData.set("body", body);
    await sendMessage(bookingId, formData);
  }

  return (
    <div className="flex h-[400px] flex-col rounded-xl border border-gray-200">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No messages yet. Say hello to coordinate pickup and payment.
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isOwn
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p>{msg.body}</p>
                  <p
                    className={`mt-1 text-xs ${
                      isOwn ? "text-emerald-100" : "text-gray-500"
                    }`}
                  >
                    {formatDate(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form action={handleSubmit} className="flex gap-2 border-t p-3">
        <Input
          name="body"
          placeholder="Type a message..."
          autoComplete="off"
          required
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
