"use client"

import type { FormEvent, RefObject } from "react"
import { SendHorizonal } from "lucide-react"
import { ChatMessageContent } from "@/components/chat/ChatMessageContent"
import FlickeringGrid from "@/components/flickering-grid"
import type { ChatMessage } from "@/components/sections/types"

type ChatSectionProps = {
  chatMessages: ChatMessage[]
  chatMessagesRef: RefObject<HTMLDivElement | null>
  chatInput: string
  setChatInput: (value: string) => void
  isSendingChat: boolean
  chatError: string | null
  handleChatSubmit: (event: FormEvent<HTMLFormElement>) => void
  maxChatMessageLength: number
  gridColor: string
  isLightMode: boolean
  chipClass: string
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
  handleChatSubmit,
  maxChatMessageLength,
  gridColor,
  isLightMode,
  chipClass,
  labelTextClass,
  chatBubbleBaseClass,
  assistantBubbleClass,
  userBubbleClass,
}: ChatSectionProps) {
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

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col overflow-hidden pt-20 md:pt-24">
        <div className="shrink-0 text-center">
          <p className={`text-lg font-light md:text-2xl ${isLightMode ? "text-black" : "text-gray-300"}`}>
            Poses tes questions pour en savoir plus sur moi !
          </p>
        </div>

        <div
          ref={chatMessagesRef}
          className="no-scrollbar my-6 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-1 py-2 md:my-8"
        >
          {chatMessages.length === 0 ? (
            <div className={`mx-auto mt-10 max-w-xl rounded-2xl border px-5 py-4 text-center text-sm leading-6 backdrop-blur-sm ${chipClass}`}>
              Demande-moi mes projets, mes competences, mes tarifs ou comment me contacter.
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
            <p
              id="chat-character-counter"
              aria-live="polite"
              className={`px-1 text-right text-xs tabular-nums ${
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
