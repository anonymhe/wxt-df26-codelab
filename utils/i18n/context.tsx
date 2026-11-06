import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { en } from "@/utils/i18n/messages/en";
import { zh } from "@/utils/i18n/messages/zh";
import type {
	Dictionary,
	Locale,
	MessageKey,
	MessageVars,
} from "@/utils/i18n/types";

const STORAGE_KEY = "ui:locale";

const DICTIONARIES: Record<Locale, Dictionary> = { en, zh };

interface I18nContextValue {
	locale: Locale;
	setLocale: (next: Locale) => void;
	/**
	 * Translates `key` for the active locale, optionally filling `{name}`
	 * placeholders. Unknown placeholders in `vars` are ignored; a placeholder
	 * with no matching value is left untouched.
	 */
	t: (key: MessageKey, vars?: MessageVars) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Fills `{name}` placeholders in a template. Kept trivially literal (a plain
 * per-key replace) so the output matches what call sites produced before
 * interpolation moved in here.
 */
function interpolate(template: string, vars?: MessageVars): string {
	if (!vars) {
		return template;
	}
	let out = template;
	for (const [name, value] of Object.entries(vars)) {
		out = out.replaceAll(`{${name}}`, String(value));
	}
	return out;
}

/** Picks a sensible default locale from the browser language. */
function defaultLocale(): Locale {
	if (
		typeof navigator !== "undefined" &&
		navigator.language.toLowerCase().startsWith("zh")
	) {
		return "zh";
	}
	return "en";
}

/** Reads the persisted locale. Guarded so a missing storage API never throws. */
async function loadLocale(): Promise<Locale> {
	try {
		const stored = await browser.storage.local.get(STORAGE_KEY);
		const locale = stored[STORAGE_KEY];
		if (locale === "zh" || locale === "en") {
			return locale;
		}
	} catch {
		// Storage API unavailable - fall through to the derived default.
	}
	return defaultLocale();
}

/** Persists the locale. Guarded so a missing storage API never throws. */
async function saveLocale(locale: Locale): Promise<void> {
	try {
		await browser.storage.local.set({ [STORAGE_KEY]: locale });
	} catch {
		// Storage API unavailable - persistence is best-effort.
	}
}

export function I18nProvider({ children }: { children: ReactNode }) {
	// Seeded from the browser language so the first paint is already close;
	// the persisted value replaces it on the next tick.
	const [locale, setLocaleState] = useState<Locale>(defaultLocale);

	// Load the persisted locale once on mount.
	useEffect(() => {
		let active = true;
		loadLocale().then((stored) => {
			if (active) {
				setLocaleState(stored);
			}
		});
		return () => {
			active = false;
		};
	}, []);

	// Keep every open surface in sync: when another surface (e.g. Options)
	// writes `ui:locale`, adopt the new locale here live. Guarded so a missing
	// storage API never throws.
	useEffect(() => {
		const handler = (
			changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
			areaName: string,
		) => {
			if (areaName !== "local" || !(STORAGE_KEY in changes)) {
				return;
			}
			const next = changes[STORAGE_KEY].newValue;
			if (next === "zh" || next === "en") {
				setLocaleState(next);
			} else if (next === undefined) {
				// Key removed - fall back to the derived default.
				setLocaleState(defaultLocale());
			}
			// Ignore any other (unexpected) value.
		};
		try {
			browser.storage.onChanged.addListener(handler);
		} catch {
			// Storage API unavailable - nothing to subscribe to.
			return;
		}
		return () => browser.storage.onChanged.removeListener(handler);
	}, []);

	// Reflect the active locale on <html lang> so every surface matches the
	// chosen language even where strings are not yet localized, and for a11y.
	// Both "zh" and "en" are LTR, so no `dir` change is needed.
	useEffect(() => {
		if (typeof document !== "undefined") {
			document.documentElement.lang = locale;
		}
	}, [locale]);

	const setLocale = useCallback((next: Locale) => {
		setLocaleState(next);
		void saveLocale(next);
	}, []);

	const t = useCallback(
		(key: MessageKey, vars?: MessageVars) =>
			interpolate(DICTIONARIES[locale][key], vars),
		[locale],
	);

	const value = useMemo<I18nContextValue>(
		() => ({ locale, setLocale, t }),
		[locale, setLocale, t],
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error("useI18n must be used within an I18nProvider");
	}
	return context;
}
