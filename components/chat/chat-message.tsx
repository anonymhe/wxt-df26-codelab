import { Loader2, TriangleAlert } from "lucide-react";
import { CitationChip } from "@/components/citation-chip";
import { MarkdownMessage } from "@/components/chat/markdown-message";
import {
	Bubble,
	BubbleContent,
} from "@/components/ui/bubble";
import {
	Message,
	MessageAvatar,
	MessageContent,
	MessageHeader,
} from "@/components/ui/message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/utils/i18n";
import type { ChatMessage } from "@/hooks/use-chat";

/**
 * One transcript row. User turns render right-aligned in the primary bubble,
 * assistant turns left-aligned in the muted bubble with an avatar. The page a
 * turn referenced rides above the bubble as a citation chip so the provenance
 * of an answer stays visible after the user navigates away.
 */
export function ChatMessageRow({ message }: { message: ChatMessage }) {
	const { t } = useI18n();
	const isUser = message.role === "user";
	const showThinking =
		!isUser && message.streaming && message.content.length === 0;

	return (
		<Message align={isUser ? "end" : "start"}>
			{!isUser ? (
				<MessageAvatar>
					<Avatar className="size-6">
						<AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
							AI
						</AvatarFallback>
					</Avatar>
				</MessageAvatar>
			) : null}

			<MessageContent>
				<MessageHeader
					className={isUser ? "justify-end" : undefined}
				>
					{isUser ? t("sidepanel.message.you") : t("sidepanel.message.assistant")}
				</MessageHeader>

				{message.citation ? (
					<div className={isUser ? "flex justify-end" : undefined}>
						<CitationChip
							title={message.citation.title}
							url={message.citation.url}
						/>
					</div>
				) : null}

				<Bubble variant={isUser ? "default" : "muted"} align={isUser ? "end" : "start"}>
					<BubbleContent>
						{showThinking ? (
							<span className="flex items-center gap-1.5 text-muted-foreground">
								<Loader2 className="size-3.5 animate-spin" />
								{t("sidepanel.message.thinking")}
							</span>
						) : (
							<MarkdownMessage
								content={message.content}
								streaming={message.streaming}
							/>
						)}
					</BubbleContent>
				</Bubble>

				{message.error ? (
					<div className="flex items-start gap-1.5 text-xs text-destructive">
						<TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
						<span>{message.error}</span>
					</div>
				) : null}
			</MessageContent>
		</Message>
	);
}
