(function(env) {
	'use strict';

	if (typeof env.define === 'function' && env.define.amd)
		env.define(touchModule);
	else
		env.touchModule = touchModule();

	function touchModule() {

		var $document = env.document;
		/*****************************************
		/* DOM touch support module
		/*****************************************/
		if (!env.CustomEvent) {
			env.CustomEvent = function (event, params) {
				var evt = $document.createEvent('CustomEvent');

				params = params || {
					bubbles:    false,
					cancelable: false,
					detail:     undefined
				};

				evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

				return evt;
			};
			env.CustomEvent.prototype = env.Event.prototype;
		}

		var TAPTRESHOLD = 200, // time within a double tap should have happend
			TAPPRECISION = 60 / 2, // distance to identify a swipe gesture
			touch = {},
			tapCount = 0, // counts the number of touchstart events
			tapTimer = 0, // timer to detect double tap
			isTouchSwipe = false, // set to true whenever
			absolute = Math.abs,
			touchSupported = 'ontouchstart' in env;

		function parentIfText (node) {
			return 'tagName' in node ? node : node.parentNode;
		}

		function dispatchEvent(type, eventObj) {
			var event;

			if (touchSupported) {
				eventObj.originalEvent.preventDefault();
				eventObj.originalEvent.stopImmediatePropagation();
			}

			event = new CustomEvent(type, {
				detail:     eventObj,
				bubbles:    true,
				cancelable: true
			});
			eventObj.target.dispatchEvent(event);
			console.log(type);

			eventObj = {};
			tapCount = 0;

			return event;
		}

		function touchStart(e) {
			var coords;

			if (!touchSupported || e.touches.length === 1) {
				coords = e.targetTouches ? e.targetTouches[0] : e;
				touch = {
					originalEvent: e,
					target:        parentIfText(e.target),
					x1:            coords.pageX,
					y1:            coords.pageY,
					x2:            coords.pageX,
					y2:            coords.pageY
				};
				isTouchSwipe = false;
				tapCount++;
				if (!e.button || e.button === 1) {
					clearTimeout(tapTimer);
					tapTimer = setTimeout(function() {
						if(absolute(touch.x2 - touch.x1) < TAPPRECISION &&
							absolute(touch.y2 - touch.y2) < TAPPRECISION &&
							!isTouchSwipe) {
							dispatchEvent((tapCount === 2) ? 'dbltap' : 'tap', touch);
							clearTimeout(tapTimer);
						}
						tapCount = 0;
					}, TAPTRESHOLD);
				}
			}
		}

		function touchMove(e) {
			var coords = e.changedTouches ? e.changedTouches[0] : e;
			isTouchSwipe = true;
			touch.x2 = coords.pageX;
			touch.y2 = coords.pageY;
			/* the following is obsolete since at least chrome handles this
			// if movement is detected within 200ms from start, preventDefault to preserve browser scroll etc.
			// if (touch.target &&
			//         (absolute(touch.y2 - touch.y1) <= TAPPRECISION ||
			//          absolute(touch.x2 - touch.x1) <= TAPPRECISION)
			//     ) {
			//         e.preventDefault();
			//         touchCancel(e);
			// }
			*/
		}

		function touchCancel(e) {
			touch = {};
			tapCount = 0;
			isTouchSwipe = false;
		}

		function touchEnd(e) {
			var distX = touch.x2 - touch.x1,
				distY = touch.y2 - touch.y1,
				absX  = absolute(distX),
				absY  = absolute(distY);
			// use setTimeout here to register swipe over tap correctly,
			// otherwise a tap would be fired immediatly after a swipe
			setTimeout(function() {
				isTouchSwipe = false;
			}, 0);
			// if there was swipe movement, resolve the direction of swipe
			if (absX || absY) {
				if(absX > absY)
					dispatchEvent((distX < 0) ? 'swipeleft' : 'swiperight', touch);
				else
					dispatchEvent((distY < 0) ? 'swipeup' : 'swipedown', touch);
			}
		}

		$document.addEventListener(touchSupported ? 'touchstart' : 'mousedown', touchStart, false);
		$document.addEventListener(touchSupported ? 'touchmove' : 'mousemove', touchMove, false);
		$document.addEventListener(touchSupported ? 'touchend' : 'mouseup', touchEnd, false);
		// on touch devices, the taphold complies with contextmenu
		// $document.addEventListener('contextmenu', function(e) {
		// 	e.preventDefault();
		// 	e.stopImmediatePropagation();
		// 	dispatchEvent('taphold', {
		// 		originalEvent: e,
		// 		target:        parentIfText(e.target)
		// 	});
		// }, false);

		if (touchSupported)
			$document.addEventListener('touchcancel', touchCancel, false);
	}

})(this);
