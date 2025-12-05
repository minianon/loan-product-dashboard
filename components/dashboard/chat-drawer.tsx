"use client"

import { useState, useRef, useEffect } from "react"
import type { LoanProduct, ChatMessage } from "@/lib/types"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { getTypeLabel } from "@/lib/utils/badge-logic"
import { Send, AlertCircle, Loader2 } from "lucide-react"

interface ChatDrawerProps {
  product: LoanProduct | null
  isOpen: boolean
  onClose: () => void
}

export default function ChatDrawer({ product, isOpen, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset messages when product changes
  useEffect(() => {
    setMessages([])
    setError(null)
  }, [product?.id])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !product || isLoading) return

    // Add user message to UI
    const userMessage: ChatMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          message: input,
          history: messages,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      // Remove the last user message on error
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 flex flex-col p-0">
        {product && (
          <>
            {/* Header */}
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-left">{product.name}</SheetTitle>
              <SheetDescription className="text-left flex items-center gap-2 pt-2">
                <Badge variant="outline">{product.bank}</Badge>
                <Badge variant="secondary" className="text-xs">
                  {getTypeLabel(product.type)}
                </Badge>
              </SheetDescription>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">APR</p>
                  <p className="font-bold text-foreground">{product.rate_apr}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Credit Score</p>
                  <p className="font-bold text-foreground">{product.min_credit_score}</p>
                </div>
              </div>
            </SheetHeader>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <Card className="p-4 bg-accent/50 border-0">
                    <p className="text-sm text-muted-foreground">
                      Hi! Ask me anything about this loan product. I can help with questions about rates, eligibility,
                      tenure, and more.
                    </p>
                  </Card>
                )}

                {messages.map((message, idx) => (
                  <div key={idx} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <Card className="p-3 bg-accent/50 border-0">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </Card>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border p-6 bg-background">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
