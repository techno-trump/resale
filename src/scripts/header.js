import throttle from "lodash.throttle";

class HeaderMenu {
	activeItem = null;
	constructor(root) {
		this.root = root;
		this.items = Array.from(root.querySelectorAll(".header-menu-item")).map(elem => new HeaderMenuItem(elem, this));
		root.addEventListener("pointerleave", (event) => this.handlePointerLeave(event));
		document.addEventListener("click", (event) => this.handleOutsideClick(event));
	}
	handlePointerLeave(event) {
		if (window.innerWidth <= 768 || !window.app.hoverMedia.matches) return;
		this.setActiveItem(null);
	}
	handleOutsideClick(event) {
		if (event.target.matches(".header-menu *, .header-menu")) return;
		this.setActiveItem(null);
	}
	setActiveItem(next) {
		this.activeItem?.setActive(false);
		this.activeItem = next;
		this.root.classList.toggle("_has-active-dropdown", next && next.hasDropdown);
		this.root.style.setProperty("--submenu-height", `${this.activeItem?.hasDropdown ? this.activeItem.height : 0}px`);
	}
	handleActiveItemResize() {
		this.root.style.setProperty("--submenu-height", `${this.activeItem?.hasDropdown ? this.activeItem.height : 0}px`);
	}
}
class HeaderMenuItem {
	constructor(root, owner) {
		this.root = root;
		this.owner = owner;
		root.addEventListener("pointerover", (event) => this.handlePointerOver(event));
		root.addEventListener("click", (event) => this.handleClick(event));
		this.hasDropdown = root.classList.contains("header-menu-item_dropdown");
		if (this.hasDropdown) {
			root.querySelector(".header-submenu__back-btn").addEventListener("click", (event) => this.handleClose(event));
			this.submenu = root.querySelector(".header-submenu");
			this.submenuContainer = root.querySelector(".header-submenu__container");
			this.observer = new ResizeObserver(throttle(() => this.handleSubmenuResize(), 25, { leading: true }));
			this.observer.observe(this.submenu);
		}
	}
	handleClose(event) {
		//event.stopPropagation();
		this.owner.setActiveItem(null);
		this.setActive(false);
	}
	handleClick(event) {
		//event.stopPropagation();
		// Если это просто линк (субменю), всегда оставляем дефолтное поведение
		if (!this.hasDropdown || event.target.matches(".header-submenu *")) return;
		// Если клик происходит в десктопном меню, и это не мобильное устройство - оставляем дефолтное поведение
		if (window.innerWidth > 768 && window.app.hoverMedia.matches) return;
		event.preventDefault();
		this.owner.setActiveItem(this);
		this.setActive(true);
	}
	handleSubmenuResize() {
		this.height = this.submenuContainer.offsetHeight;
		if (this.owner.activeItem === this) {
			this.owner.handleActiveItemResize();
		}
	}
	handlePointerOver(event) {
		if (window.innerWidth <= 768 || !window.app.hoverMedia.matches) return;
		this.owner.setActiveItem(this);
		this.setActive(true);
	}
	setActive(next) {
		this.root.classList.toggle("_active", next);
		this.submenu?.classList.toggle("_active", next);
	}
}
export class Header {
	constructor(root) {
		this.dom = { root };
		this.dom.top = root.querySelector(".header__top");
		this.menu = new HeaderMenu(root.querySelector(".header-menu"));
		this.observer = new ResizeObserver(throttle(() => this.handleResize(), 25, { leading: true }));
		this.observer.observe(root);
	}
	handleResize() {
		document.documentElement.style.setProperty("--header-height", `${this.dom.root.offsetHeight}px`);
		const headerTopBcr = this.dom.top.getBoundingClientRect();
		document.documentElement.style.setProperty("--header-top-bottom", `${headerTopBcr.top + headerTopBcr.height}px`);
	}
}