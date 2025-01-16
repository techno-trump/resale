class Node {
	
}
function isList(root) {
	return root.classList.contains("multilevel-checklist");
}
class MultilevelChecklistNode {
	constructor(root, owner) {
		this.owner = owner;
		this.dom = { root };
		this.dom.currentCheckbox = root.querySelector(".multilevel-checklist__checkbox_current");
		this.dom.inner = root.querySelector(".multilevel-checklist__inner");
		this.children = Array.from(this.dom.inner.children).map(elem => isList(elem) ?
			new MultilevelChecklistNode(elem, this) :
			new Checkbox(elem.querySelector(".multilevel-checklist__checkbox"), this));
		this.dom.currentCheckbox.addEventListener("click", () => {
			this.handleToggle();
		});
	}
	handleToggle() {
		this.setChecked(this.checked === "incomplete" || this.checked);
	}
	setChecked(next) { // Only down, only false / true
		this.setMainCheckboxChecked(next);
		this.children.forEach(item => item.setChecked(next, "down"));
		this.owner?.handleChange();
	}
	setMainCheckboxChecked(next) {
		if (next === "incomplete") {
			this.dom.currentCheckbox.checked = false;
			this.dom.currentCheckbox.setAttribute("data-incomplete", true);
		} else {
			this.dom.currentCheckbox.checked = next;
			this.dom.currentCheckbox.removeAttribute("data-incomplete");
		}
	}
	get checked() {
		return this.dom.currentCheckbox.hasAttribute("data-incomplete") ? "incomplete" : this.dom.currentCheckbox.checked;
	}
	get childrenState() {
		let hasNotChecked, hasChecked;
		for (var idx = 0; idx < this.children.length; idx++) {
			let item = this.children[idx];
				console.log(item.checked, typeof item.checked);
			if (item.checked === "incomplete") {
				hasNotChecked = true;
				hasChecked = true;
			} else if (item.checked === false) {
				hasNotChecked = true;
			} else {
				hasChecked = true;
			}
			if (hasNotChecked && hasChecked) break;
		}
		if (hasChecked) {
			if (hasNotChecked) {
				return "incomplete";
			} else {
				return true;
			}
		} else {
			return false;
		};
	}
	handleChange() { // Only UP
		this.setMainCheckboxChecked(this.childrenState, "up");
		this.owner?.handleChange("up");
	}
}
class Checkbox {
	constructor(root, owner) {
		this.owner = owner;
		this.dom = { root };
		root.addEventListener("change", (event) => {
			if (event.__skip)	return;
			owner.handleChange("up");
		});
	}
	setChecked(next, direction) {
		this.dom.root.checked = next;
	}
	get checked() {
		return this.dom.root.checked;
	}
}
export default class MultilevelChecklist {
	constructor(root) {
		this.dom = { root };
		this.rootNode = new MultilevelChecklistNode(root);
	}
}