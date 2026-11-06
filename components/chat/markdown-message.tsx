import { Markdown } from "@/components/markdown";

/**
 * The single reusable Markdown surface for a chat turn. `components/markdown.tsx`
 * owns the element styling (compact type scale tuned for the narrow panel); this
 * wrapper only decides where the prose sits inside a bubble and how streaming
 * text is announced to assistive tech.
 */
export function MarkdownMessage({
	content,
	streaming,
}: {
	content: string;
	streaming?: boolean;
}) {
	return (
		<div
			className="min-w-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
			aria-busy={streaming || undefined}
		>
			<Markdown>{content}</Markdown>
			{streaming ? (
				<span
					className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-[1px] bg-foreground/60 align-text-bottom"
					aria-hidden
				/>
			) : null}
		</div>
	);
}
