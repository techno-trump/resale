import throttle from "lodash.throttle";

const createObserver = () => {
	const mapByInner = new Map();
	const updateHeight = (instance, target) => {
		const targetBcr = target.getBoundingClientRect();
		instance.updateInnerHeightStyle(targetBcr.height);
	}
	const handleResize = (entries) => {
		entries.forEach(({ target }) => {
			updateHeight(mapByInner.get(target), target);
		});
	};
	const resizeObserver = new ResizeObserver(throttle(handleResize, 10));
	return {
		observe: (instance, inner) => {
			mapByInner.set(inner, instance);
			updateHeight(instance, inner);
			resizeObserver.observe(inner);
		}
	}
}
const resizeObserver = createObserver();

export class Disclosure {
	constructor(root) {
		this.dom = { root };
		this.dom.inner = this.dom.root.querySelector(`[data-elem*="disclosure.inner"]`);
		this.dom.toggleBtns = this.findToggleButtons();
		//Array.from(this.dom.root.querySelectorAll(`[data-elem*="disclosure.toggle"]`));
		if (this.dom.root.matches(`[data-elem*="disclosure.toggle"]`)) {
			this.dom.toggleBtns.push(this.dom.root);
		}
		this.dom.toggleBtns.forEach(elem => elem.addEventListener("click", () => this.toggle(undefined, "trigger-click")));
		resizeObserver.observe(this, this.dom.inner);
	}
	findToggleButtons() {
		const result = [];

		let innerDepth = 0; // Счётчик вложенности disclosure.inner

		const traverse = (elem) => {
			if (elem.matches(`[data-component*=":disclosure:"]`)) innerDepth++;
			if (elem.matches(`[data-elem*="disclosure.toggle"]`) && innerDepth < 1) result.push(elem);

			// Рекурсивно обходим дочерние элементы
			Array.from(elem.children).forEach(traverse);
		};
		Array.from(this.dom.root.children).forEach(traverse);
		return result;
	}
	updateInnerHeightStyle(value) {
		this.dom.root.style.setProperty("--inner-height", `${value}px`);
	}
	toggle(next, reason) {
		if (next !== undefined && next !== null) {
			next ? this.open(reason) : this.close(reason);
		} else {
			this.dom.root.classList.contains("_open") ? this.close(reason) : this.open(reason);
		}
	}
	open(reason) {
		this.dom.root.classList.add("_open");
		this.dom.toggleBtns.forEach(elem => elem.classList.add("_active"));
		this.dom.root.dispatchEvent(new CustomEvent("disclosure.open", { detail: { self: this, reason }, bubbles: true }));
	}
	close(reason) {
		this.dom.root.classList.remove("_open");
		this.dom.toggleBtns.forEach(elem => elem.classList.remove("_active"));
		this.dom.root.dispatchEvent(new CustomEvent("disclosure.close", { detail: { self: this, reason }, bubbles: true }));
	}
}
export default function initDisclosures() {
	const elems = document.querySelectorAll(`[data-component*=":disclosure:"]`);
	elems.forEach((elem) => new Disclosure(elem));
}