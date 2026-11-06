import { useEffect, useState } from "react";
import { Minus, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/utils/i18n";
import {
	DEFAULT_SETTINGS,
	type SessionSettings,
} from "@/utils/settings";

/**
 * Session parameter editor. Values are edited against a local draft so a
 * half-finished edit never rebuilds the model; "Save" commits, which is what
 * triggers a fresh session in the hook. Reset is a separate destructive action
 * because it also throws away the transcript.
 */
export function SettingsDialog({
	open,
	onOpenChange,
	settings,
	onSave,
	onResetSession,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	settings: SessionSettings;
	onSave: (next: SessionSettings) => void;
	onResetSession: () => void;
}) {
	const { t } = useI18n();
	const [draft, setDraft] = useState<SessionSettings>(settings);

	// Re-seed the draft each time the dialog opens, so a cancelled edit is
	// discarded rather than leaking into the next open.
	useEffect(() => {
		if (open) {
			setDraft(settings);
		}
	}, [open, settings]);

	const save = () => {
		onSave(draft);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("sidepanel.settings.title")}</DialogTitle>
					<DialogDescription>
						{t("sidepanel.settings.description")}
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					{/* Temperature */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="temperature">
								{t("sidepanel.settings.temperature")}
							</Label>
							<span className="text-xs tabsular-nums text-muted-foreground tabular-nums">
								{draft.temperature.toFixed(1)}
							</span>
						</div>
						<Slider
							id="temperature"
							min={0}
							max={2}
							step={0.1}
							value={[draft.temperature]}
							onValueChange={(value) =>
								setDraft({
									...draft,
									temperature: Array.isArray(value) ? value[0] : value,
								})
							}
						/>
						<p className="text-[11px] text-muted-foreground">
							{t("sidepanel.settings.temperatureHint")}
						</p>
					</div>

					{/* Top-K */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="topk">{t("sidepanel.settings.topK")}</Label>
							<span className="text-xs text-muted-foreground tabular-nums">
								{draft.topK}
							</span>
						</div>
						<Slider
							id="topk"
							min={1}
							max={64}
							step={1}
							value={[draft.topK]}
							onValueChange={(value) =>
								setDraft({
									...draft,
									topK: Array.isArray(value) ? value[0] : value,
								})
							}
						/>
						<p className="text-[11px] text-muted-foreground">
							{t("sidepanel.settings.topKHint")}
						</p>
					</div>

					{/* Answer language */}
					<div className="flex flex-col gap-2">
						<Label>{t("sidepanel.settings.language")}</Label>
						<Select
							value={draft.answerLanguage}
							onValueChange={(value) =>
								setDraft({
									...draft,
									answerLanguage: value as SessionSettings["answerLanguage"],
								})
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="auto">跟随界面 / Auto</SelectItem>
								<SelectItem value="zh-CN">简体中文</SelectItem>
								<SelectItem value="en">English</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-[11px] text-muted-foreground">
							{t("sidepanel.settings.languageHint")}
						</p>
					</div>

					{/* System prompt */}
					<div className="flex flex-col gap-2">
						<Label htmlFor="system-prompt">
							{t("sidepanel.settings.systemPrompt")}
						</Label>
						<Textarea
							id="system-prompt"
							value={draft.systemPrompt}
							onChange={(event) =>
								setDraft({ ...draft, systemPrompt: event.target.value })
							}
							placeholder={t("sidepanel.settings.systemPromptPlaceholder")}
							rows={3}
							className="text-sm"
						/>
						<p className="text-[11px] text-muted-foreground">
							{t("sidepanel.settings.systemPromptHint")}
						</p>
					</div>

					<div className="flex flex-col gap-1.5 rounded-lg bg-muted/50 p-2.5">
						<div className="flex items-center justify-between gap-2">
							<div className="min-w-0">
								<p className="text-xs font-medium">
									{t("sidepanel.settings.resetSession")}
								</p>
								<p className="text-[11px] text-muted-foreground">
									{t("sidepanel.settings.resetSessionHint")}
								</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="shrink-0"
								onClick={() => {
									onResetSession();
									onOpenChange(false);
								}}
							>
								<RotateCcw />
								{t("common.reset")}
							</Button>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="h-auto justify-start p-0 text-[11px] text-muted-foreground"
							onClick={() => setDraft({ ...DEFAULT_SETTINGS })}
						>
							<Minus />
							{t("common.reset")}参数
						</Button>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("common.cancel")}
					</Button>
					<Button onClick={save}>
						<Save />
						{t("common.save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
