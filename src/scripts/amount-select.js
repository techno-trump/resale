export function initAmountSelectors() {
	const rootElems = document.querySelectorAll(`[data-component*=":amount-select:"]`);
	rootElems.forEach(elem => {
		const inputElem = elem.querySelector("input");
		elem.addEventListener("click", ({ target }) => {
			const buttonElem = target.tagName === "BUTTON" ? target : target.closest("button");
			if (!buttonElem) return;
			if (buttonElem.classList.contains("amount-select__btn_dec")) {
				inputElem.value = +inputElem.value - 1;
			} else {
				inputElem.value = +inputElem.value + 1;
			}
			if (+inputElem.value < 0) {
				inputElem.value = 0;
			}
			inputElem.dispatchEvent(new Event("change", { bubbles: true }));
		});
		inputElem.addEventListener("input", event => {
			if (+inputElem.value < 0) {
				inputElem.value = 0;
			}
		});
	});
}