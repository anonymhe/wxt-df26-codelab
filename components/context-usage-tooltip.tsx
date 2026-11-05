import { Loader2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/utils/i18n";

// Tooltip body for the context-usage ring: spells out the exact token figures
// behind the ring so hovering explains both what the indicator means and the
// current fill of the on-device model's input window. Also hosts the
// compact-session action, which summarizes the conversation and reseeds a fresh
// session to shrink the model's context while leaving the visible transcript
// intact.
export function ContextUsageTooltip({
	used,
	total,
	onCompact,
	canCompact,
	isCompacting,
}: {
	used: number;
	total: number;
	onCompact: () => void;
	canCompact: boolean;
	isCompacting: boolean;
}) {
	const { t } = useI18n();
	const percent = total > 0 ? Math.round((used / total) * 100) : 0;
	const numberFormat = new Intl.NumberFormat();
	return (
		<div className="flex flex-col gap-1.5">
			<span className="font-medium">{t("sidepanel.context.usage")}</span>
			{/*
				Context figures sit on the left; the compact-session action sits on
				the right. items-end keeps the button baseline-aligned with the
				multi-line figures block.
			*/}
			<div className="flex items-end justify-between gap-3">
				<div className="flex min-w-0 flex-col gap-0.5">
					{total > 0 ? (
						<>
							<span className="tabular-nums">
								{t("sidepanel.context.figures", {
									used: numberFormat.format(used),
									total: numberFormat.format(total),
									percent,
								})}
							</span>
							<span className="text-background/70">
								{t("sidepanel.context.window")}
							</span>
						</>
					) : (
						<span className="text-background/70">
							{t("sidepanel.context.noUsage")}
						</span>
					)}
				</div>
				{/*
					This button renders on the tooltip's dark surface (bg-foreground),
					so it carries its own light-on-dark colors and stays fully visible
					at rest — not only on hover. Hover/disabled states are explicit for
					the same reason.
				*/}
				<Button
					variant="outline"
					size="sm"
					className="shrink-0 border-background/30 bg-transparent text-background hover:bg-background/15 hover:text-background disabled:opacity-50"
					onClick={onCompact}
					disabled={!canCompact || isCompacting}
				>
					{isCompacting ? <Loader2 className="animate-spin" /> : <Minimize2 />}
					{t("sidepanel.context.compact")}
				</Button>
			</div>
		</div>
	);
}
