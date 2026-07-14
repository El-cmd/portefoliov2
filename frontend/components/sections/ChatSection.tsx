"use client"

import type { FormEvent, RefObject } from "react"
import { MessageSquareText, SendHorizonal } from "lucide-react"
import { ChatMessageContent } from "@/components/chat/ChatMessageContent"
import FlickeringGrid from "@/components/flickering-grid"
import type { ChatMessage } from "@/components/sections/types"

const suggestedQuestions = [
  "Qui es-tu ?",
  "Comment te contacter ?",
  "Quels sont tes reseaux sociaux ?",
  "Quelles sont tes skills ?",
]

type ChatSectionProps = {
  chatMessages: ChatMessage[]
  chatMessagesRef: RefObject<HTMLDivElement | null>
  chatInput: string
  setChatInput: (value: string) => void
  isSendingChat: boolean
  chatError: string | null
  chatRateLimitRemaining: number | null
  chatRateLimitRetryAfterSeconds: number | null
  handleChatSubmit: (event: FormEvent<HTMLFormElement>) => void
  onSelectQuestion: (question: string) => void
  onScrollHome: () => void
  maxChatMessageLength: number
  gridColor: string
  isLightMode: boolean
  chipClass: string
  arrowButtonClass: string
  labelTextClass: string
  chatBubbleBaseClass: string
  assistantBubbleClass: string
  userBubbleClass: string
}

export function ChatSection({
  chatMessages,
  chatMessagesRef,
  chatInput,
  setChatInput,
  isSendingChat,
  chatError,
  chatRateLimitRemaining,
  chatRateLimitRetryAfterSeconds,
  handleChatSubmit,
  onSelectQuestion,
  onScrollHome,
  maxChatMessageLength,
  gridColor,
  isLightMode,
  chipClass,
  arrowButtonClass,
  labelTextClass,
  chatBubbleBaseClass,
  assistantBubbleClass,
  userBubbleClass,
}: ChatSectionProps) {
  const quickQuestionClass = isLightMode
    ? "border-black/10 bg-white/80 text-black hover:border-black/25 hover:bg-black hover:text-white disabled:bg-neutral-100 disabled:text-neutral-400"
    : "border-white/10 bg-white/[0.045] text-white hover:border-white/25 hover:bg-white hover:text-black disabled:bg-white/[0.03] disabled:text-white/35"

  return (
    <section className={`chat-section relative h-screen overflow-hidden px-4 snap-start md:px-6 ${isLightMode ? "bg-white" : "bg-black"}`}>
      <FlickeringGrid
        className="absolute inset-0 z-0"
        color={gridColor}
        maxOpacity={0.1}
        minOpacity={0.025}
        squareSize={3}
        gridGap={6}
        flickerChance={0.18}
        flickerDensity={0.055}
        fps={16}
        hoverRadius={46}
        hoverOpacity={0.18}
        hoverScale={1.28}
      />

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col overflow-hidden pt-12 md:pt-16">
        <div className="shrink-0 text-center">
          <div className="mb-6 flex flex-col items-center gap-3 md:mb-8">
            <span className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] backdrop-blur-sm ${chipClass}`}>
              Home
            </span>
            <button
              type="button"
              onClick={onScrollHome}
              aria-label="Scroll to home"
              className={arrowButtonClass}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </button>
          </div>
          <p className={`text-lg font-light md:text-2xl ${isLightMode ? "text-black" : "text-gray-300"}`}>
            Poses tes questions pour en savoir plus sur moi !
          </p>
        </div>

        <div
          ref={chatMessagesRef}
          className="no-scrollbar my-6 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-1 py-2 md:my-8"
        >
          {chatMessages.length === 0 ? (
            <div className={`mx-auto mt-10 w-full max-w-2xl rounded-2xl border px-5 py-5 text-sm leading-6 backdrop-blur-sm ${chipClass}`}>
              <p className="text-center">
                Demande-moi mes projets, mes competences, mes tarifs ou comment me contacter.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => onSelectQuestion(question)}
                    disabled={isSendingChat}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium leading-5 transition disabled:cursor-not-allowed ${quickQuestionClass}`}
                  >
                    <MessageSquareText className="h-4 w-4 shrink-0" />
                    <span>{question}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`${chatBubbleBaseClass} ${
                  message.role === "user" ? userBubbleClass : assistantBubbleClass
                }`}
              >
                {message.role === "assistant" ? (
                  <ChatMessageContent content={message.content} isLightMode={isLightMode} />
                ) : (
                  message.content
                )}
              </div>
            ))
          )}

          {isSendingChat ? (
            <div className={`${chatBubbleBaseClass} ${assistantBubbleClass}`}>
              Recherche dans la base de connaissance...
            </div>
          ) : null}

          {chatError ? (
            <div className={`self-start rounded-2xl border px-4 py-3 text-sm ${
              isLightMode ? "border-red-600/30 bg-red-50 text-red-700" : "border-red-400/30 bg-red-950/30 text-red-200"
            }`}>
              {chatError}
            </div>
          ) : null}
        </div>

        {chatMessages.length > 0 && !isSendingChat ? (
          <div className="no-scrollbar -mt-2 flex shrink-0 gap-2 overflow-x-auto pb-3">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => onSelectQuestion(question)}
                disabled={isSendingChat}
                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition disabled:cursor-not-allowed ${quickQuestionClass}`}
              >
                <MessageSquareText className="h-3.5 w-3.5" />
                {question}
              </button>
            ))}
          </div>
        ) : null}

        <form
          onSubmit={handleChatSubmit}
          className={`shrink-0 flex items-center gap-3 border-t py-4 md:py-5 ${isLightMode ? "border-black/10" : "border-white/10"}`}
        >
          <div className="min-w-0 flex-1">
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              aria-label="Message"
              aria-describedby="chat-character-counter"
              placeholder="Message..."
              maxLength={maxChatMessageLength}
              disabled={isSendingChat}
              className={`w-full bg-transparent px-1 py-3 text-base outline-none ${
                isLightMode ? "text-black placeholder:text-neutral-500" : "text-white placeholder:text-gray-600"
              }`}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
              <p
                aria-live="polite"
                className={`tabular-nums ${isLightMode ? "text-neutral-600" : "text-gray-400"}`}
              >
                Quota estimé: {chatRateLimitRemaining ?? "?"} requetes restantes
                {chatRateLimitRetryAfterSeconds ? `, reessaie dans ${chatRateLimitRetryAfterSeconds}s` : ""}
              </p>
              <p
                id="chat-character-counter"
                aria-live="polite"
                className={`tabular-nums ${
                  maxChatMessageLength - chatInput.length <= 100
                    ? isLightMode
                      ? "text-red-700"
                      : "text-red-300"
                    : labelTextClass
                }`}
              >
                {maxChatMessageLength - chatInput.length} caracteres restants
              </p>
            </div>
          </div>
          <button
            type="submit"
            aria-label="Envoyer"
            disabled={isSendingChat || !chatInput.trim()}
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition ${
              isLightMode
                ? "bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500"
                : "bg-white text-black hover:bg-gray-200 disabled:bg-white/20 disabled:text-white/40"
            }`}
          >
            <SendHorizonal className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  )
}
