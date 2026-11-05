import {
	CircleCheck,
	CircleHelp,
	CircleX,
	Download,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AiFeature, FeatureStatus } from "@/utils/ai-features";
import { useI18n } from "@/utils/i18n";
import type { MessageKey } from "@/utils/i18n/types";

/**
 * Presentation metadata per status: the icon, its colour class, and the message
 * key used for the label. Labels live in the i18n catalog so every surface
 * (popup and options) renders in the active locale.
 */
const STATUS_META: Record<
	FeatureStatus,
	{ labelKey: MessageKey; className: string; Icon: typeof CircleCheck }
> = {
	checking: {
		labelKey: "status.checking",
		className: "text-muted-foreground",
		Icon: Loader2,
	},
	available: {
		labelKey: "status.available",
		className: "text-emerald-600 dark:text-emerald-400",
		Icon: CircleCheck,
	},
	downloadable: {
		labelKey: "status.downloadable",
		className: "text-amber-600 dark:text-amber-400",
		Icon: Download,
	},
	downloading: {
		labelKey: "status.downloading",
		className: "text-amber-600 dark:text-amber-400",
		Icon: Download,
	},
	unavailable: {
		labelKey: "status.unavailable",
		className: "text-destructive",
		Icon: CircleX,
	},
	unsupported: {
		labelKey: "status.unsupported",
		className: "text-muted-foreground",
		Icon: CircleHelp,
	},
};

/** Converts the API's 0-1 progress into a rounded 0-100 percentage. */
function toPercent(progress: number | undefined): number | null {
	return progress != null ? Math.round(progress * 100) : null;
}

/**
 * The dotted-underline feature name; hovering reveals the feature description.
 * Base-ui's `render` prop turns the span itself into the tooltip trigger, so
 * the label is children rather than being nested inside a wrapper element.
 */
function FeatureName({ feature }: { feature: AiFeature }) {
	const { t } = useI18n();
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<span className="cursor-help text-sm text-foreground underline decoration-dotted decoration-muted-foreground/50 underline-offset-4" />
				}
			>
				{t(feature.name)}
			</TooltipTrigger>
			<TooltipContent side="right" className="max-w-xs text-left">
				{t(feature.description)}
			</TooltipContent>
		</Tooltip>
	);
}

/**
 * Idle status pill: an icon plus the localized label for the current status.
 * `checking` spins its icon so a probe in flight reads as activity.
 */
function StatusBadge({ status }: { status: FeatureStatus }) {
	const { t } = useI18n();
	const { labelKey, className, Icon } = STATUS_META[status];
	return (
		<span
			className={`flex items-center gap-1.5 text-sm font-medium ${className}`}
		>
			<Icon
				className={status === "checking" ? "size-3.5 animate-spin" : "size-3.5"}
			/>
			{t(labelKey)}
		</span>
	);
}

/**
 * In-flight download pill: a spinner with the localized percentage, falling
 * back to the plain "Downloading" label until the first progress event lands.
 */
function DownloadingBadge({ progress }: { progress: number | undefined }) {
	const { t } = useI18n();
	const pct = toPercent(progress);
	return (
		<span
			className={`flex items-center gap-1.5 text-sm font-medium ${STATUS_META.downloading.className}`}
		>
			<Loader2 className="size-3.5 animate-spin" />
			{pct != null
				? t("selfCheck.downloadingPercent", { percent: pct })
				: t(STATUS_META.downloading.labelKey)}
		</span>
	);
}

/**
 * The "download this model" affordance, shown while the row is downloadable.
 * Hovering explains which model is fetched and roughly how large it is.
 */
function DownloadButton({
	feature,
	onDownload,
}: {
	feature: AiFeature;
	onDownload: () => void;
}) {
	const { t } = useI18n();
	const download = t("selfCheck.download");
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						variant="link"
						size="sm"
						className="text-amber-600 hover:text-amber-700 dark:text-amber-400 m-0 p-0 h-[20px]"
						aria-label={t("selfCheck.downloadModelAria", {
							name: t(feature.name),
						})}
						onClick={onDownload}
					/>
				}
			>
				<Download />
				{download}
			</TooltipTrigger>
			<TooltipContent side="left" className="max-w-xs text-left">
				{download} {t(feature.modelName)}
				<br />
				{t(feature.estimatedSize)}
			</TooltipContent>
		</Tooltip>
	);
}

/**
 * One feature row: its name (with a description tooltip) on the left, and the
 * status-dependent control on the right - a download action, live download
 * progress, or the plain status pill. A progress bar renders below the row
 * only while a download is in flight; `null` there means indeterminate.
 */
export function StatusRow({
	feature,
	status,
	progress,
	onDownload,
}: {
	feature: AiFeature;
	status: FeatureStatus;
	progress: number | undefined;
	onDownload: () => void;
}) {
	const { t } = useI18n();
	const isDownloading = status === "downloading";

	return (
		<div className="flex flex-col gap-1.5 py-1.5">
			<div className="flex items-center justify-between gap-3">
				<FeatureName feature={feature} />
				{status === "downloadable" ? (
					<DownloadButton feature={feature} onDownload={onDownload} />
				) : isDownloading ? (
					<DownloadingBadge progress={progress} />
				) : (
					<StatusBadge status={status} />
				)}
			</div>

			{isDownloading ? (
				<Progress
					value={toPercent(progress)}
					className="gap-0"
					aria-label={t("selfCheck.downloadProgressAria", {
						name: t(feature.name),
					})}
				/>
			) : null}
		</div>
	);
}
