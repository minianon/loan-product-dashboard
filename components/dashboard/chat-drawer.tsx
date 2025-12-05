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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Reset messages when product changes
  useEffect(() => {
    if (product?.id) {
      setMessages([])
      setError(null)
      setInput("")
    }
  }, [product?.id])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }
      }
    }
    
    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || !product || isLoading) return

    const userMessage: ChatMessage = { role: "user", content: input.trim() }
    const currentInput = input.trim()
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
          message: currentInput,
          history: messages,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to get response")
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
      <SheetContent 
        side="right" 
        className="w-full sm:w-[420px] flex flex-col p-0 h-screen max-h-screen overflow-hidden"
      >
        {product && (
          <>
            {/* Fixed Header */}
            <SheetHeader className="border-b border-border p-4 sm:p-6 flex-shrink-0 bg-background">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <SheetTitle className="text-left text-lg sm:text-xl">{product.name}</SheetTitle>
                  <SheetDescription className="text-left flex items-center gap-2 pt-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">{product.bank}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getTypeLabel(product.type)}
                    </Badge>
                  </SheetDescription>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">APR</p>
                      <p className="font-bold text-foreground">{product.rate_apr}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Credit Score</p>
                      <p className="font-bold text-foreground">{product.min_credit_score}+</p>
                    </div>
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Scrollable Chat Area */}
            <ScrollArea 
              ref={scrollAreaRef}
              className="flex-1 min-h-0 px-4 sm:px-6 py-4"
            >
              <div className="space-y-4 pb-4">
                {messages.length === 0 && (
                  <Card className="p-4 bg-accent/50 border-0">
                    <p className="text-sm text-muted-foreground">
                      Hi! Ask me anything about this loan product. I can help with questions about rates, eligibility,
                      tenure, and more.
                    </p>
                  </Card>
                )}

                {messages.map((message, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-4 py-2.5 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-accent/50 rounded-lg px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <div ref={messagesEndRef} className="h-1" />
              </div>
            </ScrollArea>

            {/* Fixed Input Area */}
            <div className="border-t border-border p-4 sm:p-6 bg-background flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim()) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 min-w-0"
                  aria-label="Chat input"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="bg-primary hover:bg-primary/90 text-white flex-shrink-0"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
