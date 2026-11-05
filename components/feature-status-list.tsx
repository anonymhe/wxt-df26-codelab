import { StatusRow } from "@/components/ai-feature-status";
import {
	AI_FEATURES,
	type AiFeature,
	type FeatureStatus,
} from "@/utils/ai-features";

/**
 * The list of Built-in AI feature rows shared by the popup and the options
 * self-check section, so both surfaces render identical rows and localized
 * labels. The owning surface keeps the detection state (it also needs
 * `detect()` for its re-check button) and passes the per-feature status in.
 */
export function FeatureStatusList({
	statuses,
	progress,
	onDownload,
}: {
	statuses: Record<string, FeatureStatus>;
	progress: Record<string, number>;
	onDownload: (feature: AiFeature) => void;
}) {
	return (
		<>
			{AI_FEATURES.map((feature) => (
				<StatusRow
					key={feature.key}
					feature={feature}
					status={statuses[feature.key] ?? "checking"}
					progress={progress[feature.key]}
					onDownload={() => onDownload(feature)}
				/>
			))}
		</>
	);
}
