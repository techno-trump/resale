import throttle from "lodash.throttle"
import TomSelect from 'tom-select'

// Selector for Select control:
// data-sell-product-select - specifies that current element is TomSelect select
// data-sell-product-select-searchable - adds input for search

// init selects with TomSelect
document.querySelectorAll(`[data-sell-product-select]`).forEach(elem => {
  const searchable = elem.hasAttribute('data-sell-product-select-searchable')

  // configuration for TomSelect
	const options = {
    // styles
    wrapperClass: "select select_field",
		controlClass: "select__control",
		dropdownClass: "select__dropdown",
		dropdownContentClass: "select__options-list",
		optionClass: 'select__option',
		itemClass: "select__item",

    // disable search by default
    controlInput: false,

    // plugins
		plugins: {
			addons: {},
			dropdown_position: {},
		}
	};

  // add searchable select config
  if (searchable) {
    // remove disabling
    delete options.controlInput
  }

  console.log(options)

  // configure dropdown position
	TomSelect.define("dropdown_position", function dropdownPosition(options) {
    // min width for dropdown
		const dropdownMinWidth = 300;
    // handle resizes
		this.on('dropdown_open', resetPosition);

		const self = this;
		
    // handle resizes
		window.addEventListener("resize", throttle(resetPosition, 25));

    // to change position of dropdown
		function resetPosition() {
			const { right } = self.wrapper.getBoundingClientRect();

			if (right - dropdownMinWidth > 0 || self.wrapper.offsetWidth > dropdownMinWidth) {
				self.dropdown.classList.remove("select__dropdown_left");
				self.dropdown.classList.add("select__dropdown_right");
			} else {
				self.dropdown.classList.remove("select__dropdown_right");
				self.dropdown.classList.add("select__dropdown_left");
			} 
		}
	});

  // configure additional event handlers
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