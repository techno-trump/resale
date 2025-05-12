export function initTabsSwitch() {
	document.querySelectorAll(`[data-component*=":tabs-switch:"]`).forEach(root => {
			new TabsSwitch(root);
	});
}

export function initTabs() {
	document.querySelectorAll(`[data-component*=":tabs-list:"]`).forEach(root => {
			const switchSelector = root.getAttribute("data-tabs-for");
			if (!switchSelector) return;

			const switchElem = document.querySelector(`[data-component*=":tabs-switch:"][data-switch-for="${switchSelector}"]`);
			if (!switchElem) return;

			new Tabs(root, switchElem);
	});
}

class TabsSwitch {
	constructor(root) {
			this.root = root;
			this.activeBtn = this.root.querySelector(".tabs-switch__btn_active");

			this.root.querySelectorAll(".tabs-switch__btn").forEach((item, idx) => item.setAttribute("data-idx", idx));

			this.root.addEventListener("click", this.handleClick.bind(this));
	}

	handleClick(e) {
			const btn = e.target?.closest(".tabs-switch__btn");
			if (!btn || this.activeBtn === btn) return;

			this.activeBtn?.classList.remove("tabs-switch__btn_active");
			btn.classList.add("tabs-switch__btn_active");
			this.activeBtn = btn;

			const idx = btn.getAttribute("data-idx");
			this.root.dispatchEvent(new CustomEvent("tab-change", { detail: { idx: Number(idx) } }));
	}
}
class Tabs {
	constructor(root, switchElem) {
			this.root = root;
			this.switchElem = switchElem;
			this.activeTab = this.root.querySelector(".tabs__panel_active");
			this.tabs = Array.from(this.root.querySelectorAll(".tabs__panel"));
			this.switchElem.addEventListener("tab-change", this.handleTabChange.bind(this));
	}

	handleTabChange({ detail }) {
			const { idx } = detail;
			if (this.activeTab === this.tabs[idx]) return;
			this.activeTab?.classList.remove("tabs__panel_active");
			this.tabs[idx]?.classList.add("tabs__panel_active");
			this.activeTab = this.tabs[idx];
	}
}
