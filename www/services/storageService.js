(function() {
	'use strict';

	define([
	], function() {

		var storage = {
			getKey: getKey
		};

		return storage;

		function getKey(key) {
			var wrapper = {
				key:  key,
				obj:  {},
				save: _save
			};

			wrapper.obj = JSON.parse(localStorage.getItem(key));

			return wrapper;
		}

		function _save() {
			localStorage.setItem(this.key, JSON.stringify(this.obj));
		}
	});

})();
