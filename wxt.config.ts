import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	manifest: {
		// activeTab/tabs let us read the active foreground tab's id/title/url, and
		// scripting + host_permissions ['<all_urls>'] let chrome.scripting.executeScript
		// run the text-extraction function in arbitrary foreground tabs for the
		// "use current page content" toggle.
		// tabs + scripting + host_permissions ['<all_urls>'] let the side panel read
		// the active tab's text (chrome.scripting.executeScript) and capture its
		// viewport for image attachments. `action` backs the icon-click handler in
		// background.ts that opens the side panel.
		permissions: [
			"sidePanel",
			"action",
			"activeTab",
			"scripting",
			"tabs",
			"storage",
		],
		host_permissions: ["<all_urls>"],
	},
	vite: () => ({
		plugins: [tailwindcss()],
	}),
});
