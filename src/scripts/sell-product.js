import throttle from "lodash.throttle"
import TomSelect from 'tom-select'

// Selector for Select control:
// data-sell-product-select - specifies that current element is TomSelect select
// data-sell-product-select-radio - specifies that options will have radio button
// data-sell-product-select-searchable - adds input for search
// data-sell-product-select-options-columns - specifies number of columns for options (1 by default)

// init selects with TomSelect
document.querySelectorAll(`[data-sell-product-select]`).forEach(elem => {
	if (elem.tomselect) elem.tomselect.destroy()

  const searchable = elem.hasAttribute('data-sell-product-select-searchable')
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
	}

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
	})

  // configure additional event handlers
	TomSelect.define("addons", function() {
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
	})

	new TomSelect(elem, options)

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

// Custom Color select (particular case)
const colorOptions = [
  { "value": "beige", "text": "Бежевий", "color": "#D6C8AE" },
  { "value": "khaki", "text": "Хакі", "color": "#6C672B" },
  { "value": "turquoise", "text": "Бірюзовий", "color": "#90E9DA" },
  { "value": "white", "text": "Білий", "color": "#FFFFFF" },
  { "value": "light-blue", "text": "Блакитний", "color": "#D0E4F7" },
  { "value": "burgundy", "text": "Бордовий", "color": "#6A1313" },
  { "value": "yellow", "text": "Жовтий", "color": "#FEFE3D" },
  { "value": "mustard", "text": "Гірчичний", "color": "#FFA700" },
  { "value": "gold", "text": "Золотий", "color": "#F3D68A" },
  { "value": "green", "text": "Зелений", "color": "#51AC7B" },
  { "value": "brown", "text": "Коричневий", "color": "#9E6420" },
  { "value": "coral", "text": "Кораловий", "color": "#FE0000" },
  { "value": "multi", "text": "Мульті", "image": "./img/sell-product/multi.color.png" },
  { "value": "red", "text": "Червоний", "color": "#FF0000" },
  { "value": "pink", "text": "Рожевий", "color": "#FE92E6" },
  { "value": "orange", "text": "Помаранчевий", "color": "#FEA800" },
  { "value": "blue", "text": "Синій", "color": "#0019A3" },
  { "value": "light-green", "text": "Салатовий", "color": "#74E70E" },
  { "value": "purple", "text": "Фіолетовий", "color": "#B6089D" },
  { "value": "gray", "text": "Сірий", "color": "#7B7B7B" },
  { "value": "fuchsia", "text": "Фуксія", "color": "#C7227D" },
  { "value": "dark-blue", "text": "Темно-синій", "color": "#041230" },
  { "value": "black", "text": "Чорний", "color": "#000000" },
  { "value": "milk", "text": "Молочний", "color": "#FEF8F1" },
  { "value": "anthracite", "text": "Антрацит", "color": "#444344" },
  { "value": "other", "text": "Інше", "image": "./img/sell-product/other.color.png" }
]

document.querySelectorAll('[data-sell-product-select-color]').forEach(select => {
	if (select.tomselect) select.tomselect.destroy()

  const searchable = select.hasAttribute('data-sell-product-select-searchable')
	const optionsColumns = Number(select.getAttribute('data-sell-product-select-options-columns') ?? 1)
  
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
		},

		// set color options
		options: colorOptions,

		render: {
			option: function(data, escape) {
        return `
					<div 
						class="sell-product__select-custom-option sell-product__radio-box" 
						data-sell-product-select-option
						data-value="${data.value}"
					>
          	<input class="sell-product__radio" type="radio" name="radio" />

						${data.image ? `<img class="sell-product__select-custom-option-color" src="${data.image}">` : ''}
						${data.color ? `<div class="sell-product__select-custom-option-color" style="--color: ${data.color}"></div>` : ''}

						<label>${escape(data.text)}</label>
        	</div>
				`
      }
		},

		onDropdownOpen: function(dropdown) {
			const selectedValue = this.getValue()

			// Update radio buttons manually based on selected value
			dropdown.querySelectorAll('[data-sell-product-select-option]').forEach(option => {
				const radio = option.querySelector('input[type=radio]')
				if (!radio) return
				
				// set radio checked
				const value = option.getAttribute('data-value')
				radio.checked = value === selectedValue
			});
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

	new TomSelect(select, options);

	// additional settings
	const customSelectElement = select.nextElementSibling
	if (customSelectElement) {
		customSelectElement.style.setProperty('--options-columns', optionsColumns)
		customSelectElement.querySelector('.select__dropdown').setAttribute('data-lenis-prevent', '');
	}
})
