import "../styles/index.scss";
import 'imask';
import "./fslightbox.js";
import throttle from "lodash.throttle";
import { initAmountSelectors } from "./amount-select.js";
import { initTabsSwitch, initTabs } from "./tabs.js";

import EventEmitter from "eventemitter3";
import { Header } from "./header.js";
import { isMobile } from "./utils.js";
import initDisclosures from "./disclosure.js";
import TomSelect from "tom-select";
import KeenSlider from "keen-slider";
import MultilevelChecklist from "./multilevel-checklist.js";
import { initDoubleRangeInputs, initMultiInputs } from "./double-range-input.js";
import { initPortals } from "./portal.js";

window.app = window.app || {};
window.app.hoverMedia = window.matchMedia("(any-hover: hover)");
window.app.events = new EventEmitter();

document.documentElement.style.setProperty("--scroll-width", `${window.innerWidth - document.documentElement.offsetWidth}px`);

document.documentElement.classList.toggle("is-mobile", isMobile.any());
initAmountSelectors();
initTabsSwitch();
initTabs();

const langSwitchSelector = `[data-component*=":lang-switch:"]`;
const langSwitchPanelSelector = `.lang-switch__panel`;
document.querySelectorAll(langSwitchSelector).forEach(elem => {
	elem.addEventListener("click", (event) => {
		event.stopPropagation();
		if (event.target instanceof Element && 
			(event.target.matches(`${langSwitchPanelSelector}, ${langSwitchPanelSelector} *`))) return;
		elem.classList.toggle("_open");
	});
	elem.querySelector(".lang-switch__close-btn").addEventListener("click", () => {
		elem.classList.remove("_open");
	})
	document.addEventListener("click", ({ target }) => {
		if (target instanceof Element && 
				(target.closest(`${langSwitchSelector}, ${langSwitchPanelSelector}`) ||
				target.matches(`${langSwitchSelector}, ${langSwitchSelector} *, ${langSwitchPanelSelector}, ${langSwitchPanelSelector} *`))) return;
		elem.classList.remove("_open");
	});
});
class SearchField {
	constructor(root, owner) {
		this.owner = owner;
		this.dom = {
			root,
			input: root.querySelector(`.search-field__input`),
			openBtn: root.querySelector(`.search-field__open-btn`),
			closeBtn: root.querySelector(`.search-field__close-btn`),
		};
		this.dom.closeBtn.addEventListener("click", () => this.setOpen(false));

		root.addEventListener("click", (event) => {
			const btn = event.target.closest(".search-field__open-btn");
			if (!btn) return;
			this.toggleOpen();
		})
		
		this.dom.input.addEventListener("input", (event) => this.handleInput(event));
	}
	handleInput(event) {
		this.owner.update();
	}
	toggleOpen() {
		this.setOpen(!this.open);
	}
	setOpen(next) {
		this.open = next;
		this.dom.closeBtn.toggleAttribute("disabled", !next);
		this.dom.root.classList.toggle("_open", next);
		if (next) setTimeout(() => this.dom.input.focus(), 100);
		this.owner.update();
	}
}
class Search {
	constructor(root) {
		this.dom = { root };
		this.dom.results = root.querySelector(".search__results");
		this.field = new SearchField(root.querySelector(`.search__field`), this);
		document.addEventListener("click", (event) => this.handleOutsideClick(event));
		setTimeout(() => {
			app.drawers.get("search-results").setOptions({
				closeOnOutsideClick: {
					checkTarget: (target) => target.matches(".search-field")
				}
			});
		}, 0);
	}
	shouldShowResults() {
		return this.field.dom.input.value.length >= 3 && this.field.open; // Если введено 3 или более знаков, показываем панель с результатами
	}
	update() {
		this.setShowResults(this.shouldShowResults()); 
	}
	handleOutsideClick(event) {
		const path = event.composedPath();
		const isInternalClick = Boolean(path.find(elem => elem === this.field.dom.root || elem === this.dom.results));
		if (isInternalClick) return;
		this.field.setOpen(false);
	}
	setShowResults(next) {
		this.dom.root.classList.toggle("_show-results", next);
		if (next) app.drawers.open("search-results")
		else app.drawers.close("search-results");
	}
}
document.querySelectorAll(`[data-component*=":search:"]`).forEach(elem => new Search(elem));
new Header(document.querySelector("#header"));
initPortals();
app.drawers.init();
app.drawers.get("storefront-filters")?.setOptions({
	modal: false,
	lockPageScroll: false,
});

matchMedia("(max-width: 768px)").addEventListener("change", ({ matches }) => {
	if (!matches) app.drawers.close("burger-menu");
});

document.querySelectorAll(`[data-component*=":select:"]`).forEach(elem => {
	const type = elem.getAttribute("data-type")?.match(/:select.(\w+):/)?.[1];
	const options = {
		controlClass: "select__control",
		dropdownClass: "select__dropdown",
		dropdownContentClass: "select__options-list",
		optionClass: 'select__option',
		itemClass: "select__item",
		plugins: {
			addons: {},
			dropdown_position: {}
		}
	};
	if (type == "field") {
		options.wrapperClass = "select select_field";
	}

	switch(type) {
		case "simple":
			options.controlInput = false;
			break;
		case "field":
			options.controlInput = false;
			break;
	}

	TomSelect.define("dropdown_position", function dropdownPosition(options) {
		const dropdownMinWidth = 300;
		this.on('dropdown_open', resetPosition);
		const self = this;
		
		window.addEventListener("resize", throttle(resetPosition, 25));

		function resetPosition() {
			const wrapperBcr = self.wrapper.getBoundingClientRect();
			if (wrapperBcr.right - dropdownMinWidth > 0 || self.wrapper.offsetWidth > dropdownMinWidth) {
				self.dropdown.classList.remove("select__dropdown_left");
				self.dropdown.classList.add("select__dropdown_right");
			} else {
				self.dropdown.classList.remove("select__dropdown_right");
				self.dropdown.classList.add("select__dropdown_left");
			} 
		}
	});

	TomSelect.define("addons", function(options = {}) {
		// plugin_options: plugin-specific options
		// this: TomSelect instance
		this.hook('after', 'setup', () => {
			const arrowElem = document.createElement("span");
			arrowElem.classList.add("icon-small-thick-arrow-down", "ts-state-indicator");
			this.control.append(arrowElem);
		});
		this.hook('after', 'open', () => {
			this.dropdown.classList.add("open");
			this.dropdown.setAttribute("aria-hidden", false);
		});
		this.hook('after', 'close', () => {
			this.dropdown.classList.remove("open");
			this.dropdown.setAttribute("aria-hidden", true);
			this.blur();
		});
	});
	

	new TomSelect(elem, options);
});

document.querySelectorAll(`[data-component*=":grid-type-select:"]`).forEach(elem => {
	const root = elem.closest(".storefront");
	const gridBtn = elem.querySelector(".grid-type-select__btn_grid");
	const columnBtn = elem.querySelector(".grid-type-select__btn_column");
	
	gridBtn.addEventListener("click", () => {
			root.classList.add("_layout-grid");
			root.classList.remove("_layout-column");
			gridBtn.classList.add("_active");
			columnBtn.classList.remove("_active");

			window.app.events.emit("storefront-grid-change");
		});
	columnBtn.addEventListener("click", () => {
			root.classList.remove("_layout-grid");
			root.classList.add("_layout-column");
			columnBtn.classList.add("_active");
			gridBtn.classList.remove("_active");

			window.app.events.emit("storefront-grid-change");
		});
});
document.querySelectorAll(`[data-component*=":recomendations:"]`).forEach(root => {
	const body = root.querySelector(".recomendations__body");
	let intervalId = null, timeoutId = null;
	const setAutoDrag = (slider) => {
		intervalId = setInterval(() => slider.next(), 3000);
	};
	const slider = new KeenSlider(body, {
		loop: true,
		selector: ".recomendations__item",
		slides: {
			perView: 4,
			spacing: 30,
		},
		breakpoints: {
			"(max-width: 1024px)": {
				slides: {
					perView: 3,
					spacing: 20,
				},
			},
			"(max-width: 768px)": {
				slides: {
					perView: 2,
					spacing: 20,
				},
			}
		},
		created: (slider) => setAutoDrag(slider),
		slideChanged: () => {
			clearInterval(intervalId);
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => setAutoDrag(slider), 2000);
		},
	});
	root.querySelector(".recomendations__btn_prev")?.addEventListener("click", () => slider.prev());
	root.querySelector(".recomendations__btn_next")?.addEventListener("click", () => slider.next());
});
document.querySelectorAll(`[data-component*=":category-recomendations:"]`).forEach(root => {
	const body = root.querySelector(".recomendations__body");
	const slider = new KeenSlider(body, {
		loop: true,
		disabled: true,
		selector: ".recomendations__item",
		breakpoints: {
			"(max-width: 768px)": {
				disabled: false,
				slides: {
					perView: "auto",
					spacing: 16,
				},
			}
		},
	});
});

document.querySelectorAll(`[data-component*=":multilevel-checklist:"]`).forEach(root => {
	new MultilevelChecklist(root);
});

// Product Card Media Slider
document.querySelectorAll(`[data-component*=":product-card-media:"]`).forEach(root => {
	const main = root.querySelector(".product-card-media__main");
	const thumbsBody = root.querySelector(".product-card-media-thumbs__body");
	const thumbsPrevBtn = root.querySelector(".product-card-media-thumbs__prev-btn");
	const thumbsNextBtn = root.querySelector(".product-card-media-thumbs__next-btn");
	
	const mainSlider = new KeenSlider(main, {
		loop: true,
		selector: ".product-card-main-media__item",
		disabled: true,
		breakpoints: {
			"(max-width: 1024px)": {
				disabled: false,
				slides: {
					perView: 1,
					spacing: 0,
				},
			},
			"(max-width: 768px)": {
				disabled: false,
				slides: {
					perView: 2.2,
					spacing: 7,
				},
			},
			"(max-width: 520px)": {
				disabled: false,
				slides: {
					perView: 1,
					spacing: 7,
				},
			}
		},
		
	});
	const basis = Math.max(100 / mainSlider.slides.length, 14);
	// const rest = 100 - basis;
	root.style.setProperty("--basis", `${basis}%`);

	mainSlider.on("detailsChanged", (self) => {
			//console.log(self.track.details.progress);
		root.style.setProperty("--shift", `${100 * self.track.details.progress}%`);
	});

	

	thumbsPrevBtn.addEventListener("click", () => {
		thumbsSlider.prev();
	});
	thumbsNextBtn.addEventListener("click", () => {
		thumbsSlider.next();
	});
	const thumbsSlider = new KeenSlider(thumbsBody, {
		loop: true,
		selector: ".product-card-media-thumbs__item",
		vertical: true,
		slides: {
			perView: 3,
			spacing: 10,
		},
	});
	thumbsSlider.slides.forEach((elem, idx) => {
		elem.addEventListener("click", () => mainSlider.moveToIdx(idx));
	});
});
const seoHiddenSection =  document.querySelector("#seo-hidden");
if (seoHiddenSection) {
	document.querySelector("#seo-toggle-btn")?.addEventListener("click", () => {
		seoHiddenSection.classList.toggle("_open");
	});
}

document.querySelectorAll(`[data-component*=":scroll-slider:"]`).forEach((root) => {
	var slider = new KeenSlider(root, {
		selector: "scroll-slider__slide",
		slides: {
			perView: "auto"
		},
		mode: "free",
	});
});
document.querySelectorAll(`[data-component*=":variants-slider:"]`).forEach((root) => {
	var slider = new KeenSlider(root, {
		selector: ".product-card__variant-item",
		disabled: false,
		slides: {
			perView: 2.4,
			spacing: 10,
		},
		mode: "free",
		breakpoints: {
			'(min-width: 1024px)': {
				disabled: true,
				slides: {
					perView: "auto"
				},
			}
		}
	});
});
document.querySelectorAll(`[data-component*=":pass-mode-toggle:"]`).forEach((root) => {
	const wrap = root.closest(".form-field");
	const input = wrap.querySelector("input");
	root.addEventListener("click", () => {
		wrap.classList.toggle("form-field_show-pass");
		if (wrap.classList.contains("form-field_show-pass")) {
			input.setAttribute("type", "text");
		} else {
			input.setAttribute("type", "password");
		}
	});
});

document.querySelectorAll(`[data-component*=":feedbacks-slider:"]`).forEach(root => {
	const body = root.querySelector(".feedbacks-slider__body");
	const prevBtn = root.querySelector(".feedbacks-slider__prev-btn");
	const nextBtn = root.querySelector(".feedbacks-slider__next-btn");
	const mainSlider = new KeenSlider(body, {
		loop: true,
		selector: ".feedback-art-card",
		slides: {
			origin: "center",
			perView: "auto",
			spacing: 60,
		},
		breakpoints: {
			"(max-width: 1620px)": {
				slides: {
					origin: "center",
					perView: "auto",
					spacing: 40,
				},
			},
			"(max-width: 768px)": {
				slides: {
					origin: "center",
					perView: "auto",
					spacing: 20,
				},
			},
			// "(max-width: 1260px)": {
			// 	slides: {
			// 		perView: 3.4,
			// 		spacing: 40,
			// 	},
			// },
			// "(max-width: 1160px)": {
			// 	slides: {
			// 		perView: 3.2,
			// 		spacing: 30,
			// 	},
			// },
			// "(max-width: 1080px)": {
			// 	slides: {
			// 		perView: 3,
			// 		spacing: 30,
			// 	},
			// },
		},
	});
	prevBtn.addEventListener("click", () => {
		mainSlider.prev();
	});
	nextBtn.addEventListener("click", () => {
		mainSlider.next();
	});
});
window.app.initCardSlider = function(root) {
	const sliderElem = root.querySelector(".card-slider__main");
	const bulletsElem = root.querySelector(".card-slider__bullets");
	const slider = new KeenSlider(sliderElem, {
		selector: ".card-slider__img",
		slides: {
			perView: 1,
			spacing: 0,
		}
	});

	sliderElem.addEventListener("pointermove", throttle(({ offsetX }) => {
		const areaSize = sliderElem.offsetWidth / slider.slides.length;
		const nextIdx = Math.floor(offsetX / areaSize);

		if (slider.track.details.rel === nextIdx) return;
		slider.moveToIdx(nextIdx);
	}), 25);
	const updateBullets = () => {
		for(let idx = 0; idx < bulletsElem.children.length; idx++) {
			bulletsElem.children[idx].classList.toggle("_active", idx === slider.track.details.rel);
		}
	}
	slider.slides.forEach((elem, idx) => {
		const bulletElem = document.createElement("span");
		bulletElem.classList.add("card-slider__bullet");
		bulletElem.classList.toggle("_active", idx === slider.track.details.rel);
		bulletsElem.append(bulletElem);
	});
	setTimeout(() => slider.update(), 0);
	slider.on("slideChanged", updateBullets);
	window.app.events.on("storefront-grid-change", () => slider.update());
}
document.querySelectorAll(`[data-component*=":card-slider:"]`).forEach(root => window.app.initCardSlider(root));
document.querySelectorAll(`[data-component*=":tel-mask:"]`).forEach(root => new IMask(root, { lazy: false, mask: '+{38}(000)00-00-000' }));

initDoubleRangeInputs("#000");
initMultiInputs();

initDisclosures();