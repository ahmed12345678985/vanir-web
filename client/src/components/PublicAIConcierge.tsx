import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  User,
  Crown,
  ChevronDown,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { useLocation } from "wouter";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function PublicAIConcierge() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "👑 **Welcome to Vanir Travel Group**\n\nI am your **AI Luxury Travel Concierge**. I am delighted to assist you in designing bespoke itineraries, private jet charters, royal Nile cruises, VIP airport fast track, and 5-star hotel accommodations in Egypt and worldwide.\n\nHow may I elevate your travel experience today?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const chatMutation = trpc.aiCommand.publicChat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "✨ Welcome to Vanir Travel Group. You can connect directly with our royal concierge team via [Contact Us](/contact) or [Book a Journey](/booking) for immediate personalized assistance.",
        },
      ]);
    },
  });

  const handleSend = (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || chatMutation.isPending) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: messageText },
    ];
    setMessages(newMessages);
    setInput("");

    chatMutation.mutate({
      messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
    });
  };

  const suggestions = [
    "5-Day Luxury Cairo & Luxor Itinerary",
    "Private Jet Charter & VIP Airport Fast Track",
    "Exclusive Seasonal Offers & Royal Packages",
    "Royal Nile Cruise & Private Egyptologist",
  ];

  if (location.startsWith("/admin")) return null;

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {!isOpen && (
          <div className="mb-2 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d1117] text-zinc-200 text-xs border border-zinc-800 shadow-xl">
            <Crown className="w-3.5 h-3.5 text-[#D4A853]" />
            <span>AI Concierge</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#0d1117] border border-[#D4A853]/40 hover:border-[#D4A853] flex items-center justify-center text-[#D4A853] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open AI Concierge"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-zinc-300" />
          ) : (
            <Sparkles className="w-5 h-5 text-[#D4A853]" />
          )}
        </button>
      </div>

      {/* Concierge Chat Modal Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[390px] h-[520px] max-h-[80vh] z-50 rounded-2xl border border-zinc-800 bg-[#0d1117] shadow-2xl flex flex-col overflow-hidden text-zinc-100">
          {/* Modal Header */}
          <div className="px-4 py-3 border-b border-zinc-800 bg-[#0d1117] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-[#D4A853]/30 flex items-center justify-center text-[#D4A853]">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 font-serif leading-tight">
                  VANIR AI Concierge
                </h3>
                <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A853] inline-block" />
                  24/7 VIP Travel Specialist
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
              aria-label="Close Concierge"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    msg.role === "user"
                      ? "bg-zinc-800 text-zinc-300"
                      : "bg-zinc-900 text-[#D4A853] border border-zinc-800"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Crown className="w-3.5 h-3.5" />
                  )}
                </div>

                <div
                  className={`max-w-[82%] rounded-xl px-3.5 py-2.5 leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#D4A853] text-black font-medium"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-200"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-xs max-w-none prose-p:my-1 prose-headings:text-zinc-100">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex gap-2 items-center text-zinc-400 text-xs bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A853]" />
                <span>Curating recommendations...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-3 py-2 bg-[#0d1117] border-t border-zinc-800 overflow-x-auto no-scrollbar">
            <div className="flex gap-1.5 whitespace-nowrap">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  disabled={chatMutation.isPending}
                  className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-[#D4A853] px-2.5 py-1 rounded-full border border-zinc-800 transition shrink-0"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#0d1117] border-t border-zinc-800 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about trips, private aviation, VIP packages..."
              className="bg-zinc-900 border-zinc-750 text-xs h-9 text-zinc-100 placeholder:text-zinc-500 focus:border-[#D4A853]"
              disabled={chatMutation.isPending}
            />

            <Button
              onClick={() => handleSend()}
              disabled={chatMutation.isPending || !input.trim()}
              size="sm"
              className="h-9 px-3 bg-[#D4A853] hover:bg-[#c49843] text-black font-bold shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
