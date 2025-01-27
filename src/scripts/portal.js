
import debounce from "lodash.debounce";
	
const pairsMemo = {};
const mediaIndex = {};
const defaultMedia = "(max-width: 767.98px)";
export function initPortals() {
		console.log("Portals have been initialized");
	const sourceElems = document.querySelectorAll("[data-portal-src]");
	const destElems = document.querySelectorAll("[data-portal-dest]");
	const destMap = [].reduce.call(destElems, (result, elem) => {
			result[elem.getAttribute("data-portal-dest")] = elem;
			return result;
		}, {});
		
	sourceElems.forEach(elem => {
		const portalName = elem.getAttribute("data-portal-src");
		const portalMedia = elem.getAttribute("data-portal-media") || defaultMedia;
		if (!destMap[portalName]) return;
		if (!mediaIndex[portalMedia]) {
			const mediaMatch = window.matchMedia(portalMedia);
			mediaIndex[portalMedia] = mediaMatch;
			pairsMemo[mediaMatch.media] = { mediaMatch, stack: [{ src: elem, dest: destMap[portalName] }], swaped: false };
			mediaMatch.addListener(swapContent);
		} else {
			const trueMedia = mediaIndex[portalMedia].media;
			pairsMemo[trueMedia].stack.push({ src: elem, dest: destMap[portalName] });
		}
	});

	Object.entries(mediaIndex).forEach(([media, mediaMatch]) => swapContent(mediaMatch));

	function swapContent({ matches, media }) {
			//alert("Media: " + media + "; Keys: " + Object.keys(pairsMemo).join);
		console.log(matches, media, pairsMemo);
		const pairs = pairsMemo[media];
		if (matches) {
			if (!pairs.swaped) {
				pairs.stack.forEach(pair => {
					pair.dest.append.apply(pair.dest, pair.src.childNodes);
				});
				pairs.swaped = true;
			}
		} else if (pairs.swaped) {
			pairs.stack.forEach(pair => {
				pair.src.append.apply(pair.src, pair.dest.childNodes);
			});
			pairs.swaped = false;
		}
	}
}
export const initPortal = (src, dest, container, rule) => {
	let swaped = false;
	let check;

	if ( typeof rule === 'number') {
		check = (elem) => {
			return elem.offsetWidth < rule;
		}
	} else { // Object or Callback
		// ...
	}

	container.addEventListener("resize", debounce((event) => {
		swapContent(check(event.target));
	}, 50));

	function swapContent(matches) {
		if (matches) {
			if (!swaped) {
				dest.append.apply(dest, src.childNodes);
				swaped = true;
			}
		} else if (swaped) {
			src.append.apply(src, dest.childNodes);
			swaped = false;
		}
	}
}