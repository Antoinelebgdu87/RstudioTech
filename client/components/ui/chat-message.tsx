import { ChatMessage as ChatMessageType } from "@shared/api";
import { BrainCircuitIcon, UserIcon, CopyIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useState } from "react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group flex gap-4 p-6 transition-colors",
        isUser ? "bg-transparent" : "bg-muted/30",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-primary to-brand-accent text-white",
        )}
      >
        {isUser ? (
          <UserIcon className="w-4 h-4" />
        ) : (
          <BrainCircuitIcon className="w-4 h-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm">
            {isUser ? "You" : "RStudio AI"}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                code: ({ inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline ? (
                    <pre className="bg-muted border border-border rounded-lg p-4 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code
                      className="bg-muted px-1.5 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border p-2 bg-muted font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border p-2">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Copy button for assistant messages */}
        {!isUser && (
          <div className="flex justify-end mt-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <CopyIcon className="w-3 h-3 mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
