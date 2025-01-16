Number.prototype.clamp = function (min, max) {
	return Math.max(min, Math.min(this.valueOf(), max));
}
export let isMobile = { Android: function () { return navigator.userAgent.match(/Android/i); }, BlackBerry: function () { return navigator.userAgent.match(/BlackBerry/i); }, iOS: function () { return navigator.userAgent.match(/iPhone|iPad|iPod/i); }, Opera: function () { return navigator.userAgent.match(/Opera Mini/i); }, Windows: function () { return navigator.userAgent.match(/IEMobile/i); }, any: function () { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); } };
export function isEmpty(value) {
	return value === null || value === undefined || value === "";
}
export function isNotEmptyString(value) {
	return typeof value === "string" && value.length > 0;
}
export function getTargetNode(target) {
	if (target instanceof Node) {
		return target;
	} else {
		const elem = document.querySelector(target);
		if (!elem) new Error(`Cannot find the target by selector: ${target}`);
		return elem;
	}
}
export function getTargetElem(target) {
	if (target instanceof Element || target === window) {
		return target;
	} else {
		const elem = document.querySelector(target);
		if (!elem) new Error(`Cannot find the target by selector: ${target}`);
		return elem;
	}
}
export const isHtmlElem = (elem) => {
	return elem && typeof elem === "object" && "tagName" in elem || false;
}
export function formatPrice(value, separator = " ") {
	const normalizedValue = typeof value === "string" ? value.trim().replace(/\s/, "") : String(value);
	const result = [];
	const tmp = normalizedValue.split("");
	// return normalizedValue.split(/\B(?=(\d{3})+$)/).join(" ");
	while (tmp.length > 0) {
		result.unshift(tmp.splice(-3).join(""));
	}
	return result.join(separator);
}
export const createElem = (name, attrs, container) => {
	var el = document.createElement(name);
	if (attrs) forEachProp(attrs, function(key, value) {
			return el.setAttribute(key, value);
	});
	if (container) container.appendChild(el);
	return el;
}
export const deepAssign = (target, ...srcs) => {
	srcs.forEach(src => {
		const queue = [{ target, src }];
		while(queue.length) {
			const { src, target } = queue.shift();
			Object.keys(src).forEach(key => {
				if (isObject(src[key]) && !(src[key] instanceof Array)) {
					if (isObject(target[key]) && !(target[key] instanceof Array)) {
						if (src[key] !== target[key]) {
							queue.push({ src: src[key], target: target[key] });
						}
					} else {
						target[key] = src[key];
					}
				} else {
					target[key] = src[key];
				}
			});
		}
	});
	return target;
}
export const parseCssValue = (value) => {
	const pattern = /(\d+)(px|%)/;
	const match = value.match(pattern);
	if (!match) return null;
	return {
		value: Number(match[1]),
		unit: match[2],
	};
}
export function isObject(target) {
	return typeof target === "object" && target != null;
}
export async function delay(value) {
	return new Promise((resolve) => setTimeout(resolve, value));
}
const prefixMap = {
  pointerdown: 'MSPointerDown',
  pointerup: 'MSPointerUp',
  pointercancel: 'MSPointerCancel',
  pointermove: 'MSPointerMove',
  pointerover: 'MSPointerOver',
  pointerout: 'MSPointerOut',
  pointerenter: 'MSPointerEnter',
  pointerleave: 'MSPointerLeave',
  gotpointercapture: 'MSGotPointerCapture',
  lostpointercapture: 'MSLostPointerCapture',
  maxTouchPoints: 'msMaxTouchPoints',
};

/*
 * detectPointerEvents object structure
 * const detectPointerEvents = {
 *   hasApi: boolean,
 *   requiresPrefix: boolean,
 *   hasTouch: boolean,
 *   maxTouchPoints: number,
 *   update() {...},
 *   prefix(value) {return value, value will only have prefix if requiresPrefix === true},
 * }
 */
export const detectPointerEvents = {
  update() {
    if (typeof window !== 'undefined') {
      // reference for detection https://msdn.microsoft.com/en-us/library/dn433244(v=vs.85).aspx
      if ('PointerEvent' in window) {
        detectPointerEvents.hasApi = true;
        detectPointerEvents.requiresPrefix = false;

        // reference for detection https://msdn.microsoft.com/library/hh673557(v=vs.85).aspx
      } else if (window.navigator && 'msPointerEnabled' in window.navigator) {
        detectPointerEvents.hasApi = true;
        detectPointerEvents.requiresPrefix = true;
      } else {
        detectPointerEvents.hasApi = false;
        detectPointerEvents.requiresPrefix = undefined;
      }
      detectPointerEvents.maxTouchPoints =
        (
          detectPointerEvents.hasApi && window.navigator &&
          window.navigator[detectPointerEvents.prefix('maxTouchPoints')]
        ) || undefined;
      detectPointerEvents.hasTouch =
        detectPointerEvents.hasApi ? detectPointerEvents.maxTouchPoints > 0 : undefined;
    }
  },
  prefix(value) {
    return (detectPointerEvents.requiresPrefix && prefixMap[value]) || value;
  },
};
export function toIndex(list, strategy) {
	const result = {};
	list.forEach(elem => {
		result[strategy(elem)] = elem;
	})
	return result;
}
detectPointerEvents.update();