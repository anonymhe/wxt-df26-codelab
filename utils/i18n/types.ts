import type { en } from "@/utils/i18n/messages/en";

export type Locale = "zh" | "en";

/**
 * Every translatable UI string, derived from the English catalog so the key
 * union can never drift from the messages actually shipped. Adding a key is a
 * single edit in `messages/en.ts`; TypeScript then forces `messages/zh.ts` to
 * provide it too, because each translation is a complete `Dictionary`.
 *
 * `import type` keeps this a compile-time-only edge, so there is no runtime or
 * module cycle between the catalog and its types.
 */
export type MessageKey = keyof typeof en;

/** A complete translation of the catalog: every key, no gaps. */
export type Dictionary = Record<MessageKey, string>;

/**
 * Values interpolated into a message template. Templates use `{name}`
 * placeholders, e.g. `"Downloading {percent}%"`.
 */
export type MessageVars = Record<string, string | number>;
