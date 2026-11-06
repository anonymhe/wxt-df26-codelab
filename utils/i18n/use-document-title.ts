import { useEffect } from "react";
import { useI18n } from "@/utils/i18n/context";
import type { MessageKey } from "@/utils/i18n/types";

/**
 * Keeps `document.title` in the active locale.
 *
 * The static `<title>` in each entrypoint's `index.html` is only the
 * pre-hydration fallback; this runs once the provider knows the real locale and
 * on every later locale switch, so the popup/tab title follows the UI language.
 */
export function useDocumentTitle(key: MessageKey = "app.title"): void {
	const { t } = useI18n();
	useEffect(() => {
		document.title = t(key);
	}, [t, key]);
}
