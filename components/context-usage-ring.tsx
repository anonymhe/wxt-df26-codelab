import { cn } from "cn";
import { useI18n } from "@/utils/i18n";

// A compact circular progress ring that visualizes how much of the on-device
// model's input context window is in use. `used` and `total` come from the
// live Prompt API session (session.inputUsage / session.inputQuota). The ring
// is a pure SVG donut so it stays crisp at small sizes and needs no extra deps.

interface ContextUsageRingProps {
	used: number;
	total: number;
	size?: number;
	strokeWidth?: number;
	className?: string;
}

export function ContextUsageRing({
	used,
	total,
	size = 20,
	strokeWidth = 2.5,
	className,
}: ContextUsageRingProps) {
	const { t } = useI18n();
	// Clamp the ratio into [0, 1] so a stale/over-budget reading never draws a
	// malformed arc. A zero/unknown quota renders an empty ring.
	const ratio = total > 0 ? Math.min(Math.max(used / total, 0), 1) : 0;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const dashOffset = circumference * (1 - ratio);

	// Shift the hue toward the destructive color as the window fills, so a near-
	// full context reads as a warning without needing a separate badge.
	const indicatorColor =
		ratio >= 0.9
			? "var(--destructive)"
			: ratio >= 0.7
				? "var(--chart-4)"
				: "var(--primary)";

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			className={cn("shrink-0 -rotate-90", className)}
			role="img"
			aria-label={t("sidepanel.context.usageAria", {
				percent: Math.round(ratio * 100),
			})}
		>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="var(--muted)"
				strokeWidth={strokeWidth}
			/>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke={indicatorColor}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeDasharray={circumference}
				strokeDashoffset={dashOffset}
				className="transition-[stroke-dashoffset,stroke] duration-300"
			/>
		</svg>
	);
}
