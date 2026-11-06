import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/utils/i18n";

/**
 * Empty-state for a fresh transcript. The example prompts are real buttons: on
 * a workshop machine the fastest way to demo the assistant is to click one and
 * send, rather than typing Chinese into the narrow composer.
 */
export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
	const { t } = useI18n();
	const examples = [
		t("sidepanel.empty.example1"),
		t("sidepanel.empty.example2"),
		t("sidepanel.empty.example3"),
	];

	return (
		<div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
			<div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
				<Sparkles className="size-5" />
			</div>
			<div className="flex flex-col gap-1">
				<h2 className="text-sm font-semibold">{t("sidepanel.empty.title")}</h2>
				<p className="text-xs leading-relaxed text-muted-foreground">
					{t("sidepanel.empty.body")}
				</p>
			</div>
			<div className="flex w-full flex-col gap-1.5">
				{examples.map((example) => (
					<Button
						key={example}
						variant="outline"
						size="sm"
						className="h-auto w-full justify-start gap-2 px-2.5 py-2 text-left text-xs font-normal whitespace-normal"
						onClick={() => onPick(example)}
					>
						<MessageCircle className="size-3.5 shrink-0 text-muted-foreground" />
						{example}
					</Button>
				))}
			</div>
		</div>
	);
}
