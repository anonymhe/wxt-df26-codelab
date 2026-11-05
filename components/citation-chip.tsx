import { Earth } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/utils/i18n";

/**
 * Derives a short, human label for the referenced page: prefer the page title,
 * else the URL host, else the localized generic fallback so the chip always
 * reads sensibly.
 */
function deriveLabel(
	title: string | undefined,
	url: string | undefined,
	fallback: string,
): string {
	const trimmed = title?.trim();
	if (trimmed) {
		return trimmed;
	}
	if (url) {
		try {
			return new URL(url).host;
		} catch {
			// Unparseable URL - fall through to the generic label.
		}
	}
	return fallback;
}

/**
 * A small, quiet chip rendered above a user bubble whose turn referenced the
 * current page. It names the referenced page (title, or the URL host as a
 * fallback) and, when clicked, opens that page.
 *
 * The URL is the one captured at send time, so it does not drift as the user
 * navigates.
 */
export function CitationChip({ title, url }: { title?: string; url?: string }) {
	const { t } = useI18n();
	const label = deriveLabel(title, url, t("sidepanel.citation.fallbackLabel"));

	// Open the captured URL. Prefer the extension API (opens a real tab even
	// from the side panel); fall back to window.open for any environment where
	// the extension tabs API is unavailable.
	const open = () => {
		if (!url) {
			return;
		}
		try {
			void browser.tabs.create({ url });
		} catch {
			window.open(url, "_blank", "noreferrer");
		}
	};

	// Render the shadcn Badge as a real <button> via its render prop so the chip
	// is natively keyboard-focusable and activatable. The outline variant keeps
	// it quiet; the single leading icon marks it as a page reference.
	return (
		<Badge
			variant="outline"
			className="max-w-full cursor-pointer"
			aria-label={t("sidepanel.citation.openPage", { label })}
			render={
				<button type="button" onClick={open} disabled={!url}>
					<Earth />
					<span className="truncate">{label}</span>
				</button>
			}
		/>
	);
}
