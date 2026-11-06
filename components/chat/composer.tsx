import { useRef, type KeyboardEvent } from "react";
import {
	Camera,
	FileText,
	ImagePlus,
	Loader2,
	Minimize2,
	SendHorizontal,
	Square,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ContextUsageRing } from "@/components/context-usage-ring";
import { ContextUsageTooltip } from "@/components/context-usage-tooltip";
import { useI18n } from "@/utils/i18n";
import type { Attachment } from "@/hooks/use-chat";
import type { PageContext } from "@/utils/page-context";

/**
 * The composer: a top textarea with the attachment tray above it, and a bottom
 * action row grouping context/attachment controls on the left and send/stop on
 * the right. Everything that costs tokens (page text, screenshots, images) is
 * opt-in per turn and visible in the tray before sending.
 */
export function Composer({
	draft,
	onDraftChange,
	onSend,
	onStop,
	busy,
	attachments,
	pageContext,
	onAttachPage,
	onDetachPage,
	onAttachScreenshot,
	onAttachImage,
	onRemoveAttachment,
	usage,
	canCompact,
	compacting,
	onCompact,
	modelReady,
}: {
	draft: string;
	onDraftChange: (value: string) => void;
	onSend: () => void;
	onStop: () => void;
	busy: boolean;
	attachments: Attachment[];
	pageContext: PageContext | null;
	onAttachPage: () => void;
	onDetachPage: () => void;
	onAttachScreenshot: () => void;
	onAttachImage: (file: File) => void;
	onRemoveAttachment: (id: string) => void;
	usage: { used: number; total: number };
	canCompact: boolean;
	compacting: boolean;
	onCompact: () => void;
	modelReady: boolean;
}) {
	const { t } = useI18n();
	const fileInput = useRef<HTMLInputElement>(null);
	const canSend =
		!busy &&
		(draft.trim().length > 0 ||
			attachments.length > 0 ||
			pageContext != null);

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		// Respect IME composition: Enter commits a Chinese candidate, it must not
		// submit the draft.
		if (event.nativeEvent.isComposing) {
			return;
		}
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			if (canSend) {
				onSend();
			}
		}
	};

	return (
		<div className="border-t bg-background p-2">
			{/* Attachment tray: the page chip plus image thumbnails. */}
			{pageContext || attachments.length > 0 ? (
				<div className="mb-2 flex flex-wrap items-center gap-1.5">
					{pageContext ? (
						<span className="flex max-w-full items-center gap-1 rounded-md bg-muted px-1.5 py-1 text-[11px] text-muted-foreground">
							<FileText className="size-3 shrink-0" />
							<span className="max-w-[180px] truncate">
								{pageContext.title || pageContext.host}
							</span>
							<button
								type="button"
								className="ml-0.5 rounded-sm p-0.5 hover:bg-background/70"
								onClick={onDetachPage}
								aria-label={t("sidepanel.composer.removeAttachment")}
							>
								<X className="size-3" />
							</button>
						</span>
					) : null}

					{attachments.map((attachment) => (
						<span
							key={attachment.id}
							className="relative flex items-center gap-1 rounded-md bg-muted p-1 pr-1.5 text-[11px] text-muted-foreground"
						>
							<img
								src={attachment.dataUrl}
								alt=""
								className="size-6 rounded-sm object-cover"
							/>
							<span className="max-w-[120px] truncate">{attachment.label}</span>
							<button
								type="button"
								className="rounded-sm p-0.5 hover:bg-background/70"
								onClick={() => onRemoveAttachment(attachment.id)}
								aria-label={t("sidepanel.composer.removeAttachment")}
							>
								<X className="size-3" />
							</button>
						</span>
					))}
				</div>
			) : null}

			<div className="rounded-xl border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
				<Textarea
					value={draft}
					onChange={(event) => onDraftChange(event.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t("sidepanel.composer.placeholder")}
					rows={3}
					className="max-h-40 min-h-16 resize-none border-0 bg-transparent px-2.5 py-2 text-sm shadow-none focus-visible:ring-0"
					aria-label={t("sidepanel.composer.placeholder")}
				/>

				<div className="flex items-center gap-1 px-1.5 pb-1.5">
					{/* Context usage ring doubles as the compact trigger's affordance. */}
					<Tooltip>
						<TooltipTrigger
							className="flex size-7 items-center justify-center rounded-md hover:bg-muted"
							aria-label={t("sidepanel.composer.contextUsage")}
						>
							<ContextUsageRing
								used={usage.used}
								total={usage.total}
								size={16}
								strokeWidth={2}
							/>
						</TooltipTrigger>
						<TooltipContent side="top" align="start" className="max-w-64">
							<ContextUsageTooltip
								used={usage.used}
								total={usage.total}
								canCompact={canCompact}
								isCompacting={compacting}
								onCompact={onCompact}
							/>
						</TooltipContent>
					</Tooltip>

					<Button
						type="button"
						variant={pageContext ? "secondary" : "ghost"}
						size="icon-sm"
						onClick={pageContext ? onDetachPage : onAttachPage}
						aria-label={
							pageContext
								? t("sidepanel.composer.attachPageOn")
								: t("sidepanel.composer.attachPage")
						}
						title={
							pageContext
								? t("sidepanel.composer.attachPageOn")
								: t("sidepanel.composer.attachPage")
						}
					>
						<FileText />
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={onAttachScreenshot}
						aria-label={t("sidepanel.composer.attachScreenshot")}
						title={t("sidepanel.composer.attachScreenshot")}
					>
						<Camera />
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={() => fileInput.current?.click()}
						aria-label={t("sidepanel.composer.attachImage")}
						title={t("sidepanel.composer.attachImage")}
					>
						<ImagePlus />
					</Button>
					<input
						ref={fileInput}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (file) {
								onAttachImage(file);
							}
							event.target.value = "";
						}}
					/>

					<span className="ml-auto hidden truncate pr-1 text-[10px] text-muted-foreground sm:block">
						{modelReady ? t("sidepanel.composer.hint") : null}
					</span>

					{busy ? (
						<Button
							type="button"
							variant="secondary"
							size="icon-sm"
							onClick={onStop}
							aria-label={t("sidepanel.composer.stop")}
						>
							<Square />
						</Button>
					) : (
						<Button
							type="button"
							size="icon-sm"
							disabled={!canSend}
							onClick={onSend}
							aria-label={t("sidepanel.composer.send")}
						>
							<SendHorizontal />
						</Button>
					)}
				</div>
			</div>

			{compacting ? (
				<p className="flex items-center justify-end gap-1 pt-1 text-[10px] text-muted-foreground">
					<Loader2 className="size-3 animate-spin" />
					{t("sidepanel.context.compacting")}
				</p>
			) : null}
		</div>
	);
}
