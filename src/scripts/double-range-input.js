const doubleRangeSelectors = {
	root: ".double-range-select",
	from: ".double-range-select__range-from",
	to: ".double-range-select__range-to",
};

export function initDoubleRangeInputs(selectionColor) {
	const fromInputSelector = doubleRangeSelectors.from;
	const toInputSelector = doubleRangeSelectors.to;
	const rootElems = document.querySelectorAll(`[data-component*=":multy-range-select:"]`);
	rootElems.forEach(rootElem => {
		const inputFromElem = rootElem.querySelector(fromInputSelector);
		const inputToElem = rootElem.querySelector(toInputSelector);
		const [fromValue, toValue] = getInputValues(inputFromElem, inputToElem);
		fillSelection(inputFromElem, fromValue, toValue);
		inputFromElem.addEventListener("input", onFromInputHandler);
		inputToElem.addEventListener("input", onToInputHandler);

		inputFromElem.addEventListener("direct-input-change", (e) => {
			const [fromValue, toValue] = getInputValues(inputFromElem, inputToElem);
			fillSelection(inputFromElem, fromValue, toValue);
		});

		function onFromInputHandler(e) {
			const [fromValue, toValue] = getInputValues(inputFromElem, inputToElem);
			if (fromValue > toValue) {
				inputFromElem.value = toValue;
			}
			fillSelection(inputFromElem, fromValue, toValue);
		}
		function onToInputHandler(e) {
			const [fromValue, toValue] = getInputValues(inputFromElem, inputToElem);
			if (toValue < fromValue) {
				inputToElem.value = fromValue;
			}
			fillSelection(inputFromElem, fromValue, toValue);
		}
	});
	function fillSelection(element, fromValue, toValue) {
		const [minValue, maxValue] = getMinMax(element);
		const range = maxValue - minValue;
		const posFrom = (fromValue - minValue) / range * 100;
		const posTo = (toValue - minValue) / range * 100;
		const bg = `linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) ${posFrom}%, ` +
			`${selectionColor} ${posFrom}%, ${selectionColor} ${posTo}%, ` +
			`rgba(0, 0, 0, 0) ${posTo}%, rgba(0, 0, 0, 0) 100%)`;
		element.style.backgroundImage = bg;
	}
}


export function initMultiInputs() {
	const fromInputSelector = ".value-multi-input__value-from";
	const toInputSelector = ".value-multi-input__value-to";
	const rootElems = document.querySelectorAll(`[data-component*=":multy-input:"]`);
	rootElems.forEach(rootElem => {
		const rangeFromInputElem = rootElem.querySelector(doubleRangeSelectors.from);
		const rangeToInputElem = rootElem.querySelector(doubleRangeSelectors.to);
		const [minValue, maxValue] = getMinMax(rangeFromInputElem);
		const inputFromElem = rootElem.querySelector(fromInputSelector);
		const inputToElem = rootElem.querySelector(toInputSelector);

		inputFromElem.value = rangeFromInputElem.value;
		inputToElem.value = rangeToInputElem.value;

		inputFromElem.addEventListener("change", onFromChangeHandler);
		inputToElem.addEventListener("change", onToChangeHandler);

		rangeFromInputElem.addEventListener("input", () => {
			inputFromElem.value = rangeFromInputElem.value;
			inputFromElem.dispatchEvent(new Event("change", { bubbles: true }));
		});
		rangeToInputElem.addEventListener("input", () => {
			inputToElem.value = rangeToInputElem.value;
			inputToElem.dispatchEvent(new Event("change", { bubbles: true }));
		});

		function onFromChangeHandler(e) {
			const [fromValue, toValue] = getInputValues(inputFromElem, inputToElem);
			if (fromValue > toValue) {
				inputFromElem.value = toValue;
			} else if (fromValue < minValue) {
				inputFromElem.value = minValue;
			}
			rangeFromInputElem.value = inputFromElem.value;
			rangeFromInputElem.dispatchEvent(new CustomEvent("direct-input-change"));
		}
		function onToChangeHandler(e) {
			const [fromValue, toValue] = getInputValues(inputFromElem, inputToElem);
			if (toValue < fromValue) {
				inputToElem.value = fromValue;
			} else if (toValue > maxValue) {
				inputToElem.value = maxValue;
			}
			rangeToInputElem.value = inputToElem.value;
			rangeFromInputElem.dispatchEvent(new CustomEvent("direct-input-change"));
		}
	});
}
function getMinMax(elem) {
	return [parseInt(elem.getAttribute("min"), 10) || 0, parseInt(elem.getAttribute("max"), 10) || 100];
}
function getInputValues(elemFrom, elemTo) {
	return [parseInt(elemFrom.value, 10), parseInt(elemTo.value, 10)];
}