import { cn } from "cn";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Hand-rolled tailwind styles tuned for the narrow side panel: tight vertical
// rhythm, small type, and colors that inherit the surrounding bubble so the
// same map reads correctly in both the default and muted bubble variants. No
// @tailwindcss/typography and no syntax-highlighting lib on purpose — this is
// deliberately compact. Every element is sized down from the prose defaults.
const COMPONENTS: Components = {
	// Headings collapse to a single compact weight/size; the panel is too narrow
	// for a full heading scale and the model rarely goes past h3.
	h1: ({ node, ...props }) => (
		<h1 className="mt-2 mb-1 text-sm font-semibold first:mt-0" {...props} />
	),
	h2: ({ node, ...props }) => (
		<h2 className="mt-2 mb-1 text-sm font-semibold first:mt-0" {...props} />
	),
	h3: ({ node, ...props }) => (
		<h3 className="mt-2 mb-1 text-sm font-semibold first:mt-0" {...props} />
	),
	h4: ({ node, ...props }) => (
		<h4 className="mt-2 mb-1 text-sm font-semibold first:mt-0" {...props} />
	),
	h5: ({ node, ...props }) => (
		<h5 className="mt-2 mb-1 text-sm font-semibold first:mt-0" {...props} />
	),
	h6: ({ node, ...props }) => (
		<h6 className="mt-2 mb-1 text-sm font-semibold first:mt-0" {...props} />
	),
	p: ({ node, ...props }) => (
		<p className="my-1 first:mt-0 last:mb-0" {...props} />
	),
	ul: ({ node, ...props }) => <ul className="my-1 list-disc pl-4" {...props} />,
	ol: ({ node, ...props }) => (
		<ol className="my-1 list-decimal pl-4" {...props} />
	),
	li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
	// Inline vs block code is distinguished by react-markdown via `inline` on the
	// legacy prop; v10 drops it, so detect a fenced block by the presence of a
	// language class or a newline, falling back to inline styling otherwise. The
	// surrounding <pre> handles the block frame; here we only paint inline code.
	code: ({ node, className, children, ...props }) => (
		<code
			className={cn(
				"rounded bg-black/10 px-1 text-[0.85em] font-mono dark:bg-white/10",
				className,
			)}
			{...props}
		>
			{children}
		</code>
	),
	// Fenced blocks: a scrollable framed box. The inner <code> inherits the
	// mono/size but the inline background is cleared so only the <pre> frame
	// shows (avoids a double-tinted box).
	pre: ({ node, ...props }) => (
		<pre
			className="my-1 block overflow-x-auto rounded-md border bg-black/5 p-2 text-xs dark:bg-white/5 [&_code]:bg-transparent [&_code]:p-0"
			{...props}
		/>
	),
	a: ({ node, ...props }) => (
		<a
			className="text-current underline"
			target="_blank"
			rel="noreferrer"
			{...props}
		/>
	),
	// GFM tables: a thin bordered grid at the panel's small type scale.
	table: ({ node, ...props }) => (
		<div className="my-1 overflow-x-auto">
			<table className="w-full border-collapse text-xs" {...props} />
		</div>
	),
	thead: ({ node, ...props }) => <thead {...props} />,
	tbody: ({ node, ...props }) => <tbody {...props} />,
	tr: ({ node, ...props }) => <tr {...props} />,
	th: ({ node, ...props }) => (
		<th className="border px-2 py-1 text-left font-semibold" {...props} />
	),
	td: ({ node, ...props }) => <td className="border px-2 py-1" {...props} />,
	blockquote: ({ node, ...props }) => (
		<blockquote
			className="my-1 border-l-2 pl-2 text-muted-foreground"
			{...props}
		/>
	),
	hr: ({ node, ...props }) => <hr className="my-2 border-border" {...props} />,
	strong: ({ node, ...props }) => (
		<strong className="font-semibold" {...props} />
	),
	em: ({ node, ...props }) => <em className="italic" {...props} />,
	del: ({ node, ...props }) => <del className="line-through" {...props} />,
};

// Render a markdown string into the compact side-panel style. remark-gfm adds
// tables, strikethrough, task lists and autolinks. react-markdown handles
// partial/streaming input natively, so this is safe to call on each token
// without guarding against incomplete markup. The wrapping div fixes the text
// color to `current` so links and code inherit the bubble's foreground in both
// the default and muted variants.
export function Markdown({ children }: { children: string }) {
	return (
		<div className="text-sm leading-relaxed [&_a]:text-current">
			<ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
				{children}
			</ReactMarkdown>
		</div>
	);
}
