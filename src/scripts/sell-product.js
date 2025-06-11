import throttle from "lodash.throttle"
import TomSelect from 'tom-select'

// Selector for Select control:
// data-sell-product-select - specifies that current element is TomSelect select
// data-sell-product-select-searchable - adds input for search
// data-sell-product-select-options-columns - specifies number of columns for options (1 by default)

// init selects with TomSelect
document.querySelectorAll(`[data-sell-product-select]`).forEach(elem => {
  const searchable = elem.hasAttribute('data-sell-product-select-searchable')
	const inline = elem.hasAttribute('data-sell-product-select-inline')
	const optionsColumns = Number(elem.getAttribute('data-sell-product-select-options-columns') ?? 1)
  
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

  // configure dropdown position
	TomSelect.define("dropdown_position", function dropdownPosition(options) {
    // min width for dropdown
		const dropdownMinWidth = 250;
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

	// additional settings
	const customSelectElement = elem.nextElementSibling
	if (customSelectElement) {
		customSelectElement.style.setProperty('--options-columns', optionsColumns)
		customSelectElement.querySelector('.select__dropdown').setAttribute('data-lenis-prevent', '');
	}
});

// Selector for image uploading
// data-sell-product-upload - specifies that current element is upload

document.querySelectorAll('[data-sell-product-upload]').forEach(element => {
	// indicator this file is uploaded
	const uploadedModifier = 'sell-product__image_uploaded'

	const preview = element.querySelector('[data-sell-product-upload-preview]')
	const remove = element.querySelector('[data-sell-product-upload-remove]')
	const input = element.querySelector('[data-sell-product-upload-input]')

	// handle drop
	element.addEventListener('drop', (e) => {
		const files = Array.from(e?.dataTransfer?.files ?? [])
		const image = files.find(file => file.type.startsWith('image/'))
		if (!image) return

		const url = URL.createObjectURL(image)
		preview.setAttribute('src', url)

		// indicate upload
		element.classList.add(uploadedModifier)
	})

	// handle input upload
	input.addEventListener('change', (e) => {
		const files = Array.from(e?.target?.files ?? [])
		const image = files.find(file => file.type.startsWith('image/'))
		if (!image) return

		const url = URL.createObjectURL(image)
		preview.setAttribute('src', url)

		// indicate upload
		element.classList.add(uploadedModifier)
	})

	// handle remove 
	remove.addEventListener('click', (e) => {
		// to prevent input clicking
		e.stopPropagation()

		preview.removeAttribute('src')

		element.classList.remove(uploadedModifier)
	})
})
