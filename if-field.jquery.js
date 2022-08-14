/**
 * =========================================
 * If Field JS
 * =========================================
 *
 * Description: JQuery plugin to conditionally display DOM element based on input, select or textarea value.
 * Author: Windel Oira ( https://github.com/windel07 )
 * Version: 1.0.0
 */

var IfField = (function () {
	let listeners = [];
	const targets = $("[data-if]");

	const debounce = (func, wait, immediate) => {
		var timeout;

		return function () {
			var context = this,
				args = arguments;
			var later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	const initialize = () => {
		if (targets.length) {
			targets.hide();

			listeners = Array.from(
				targets.map(function () {
					const ifTarget = $(this);
					const ifLogic = ifTarget.data("logic") || "&&";
					const ifInputs = [];

					const ifStatement = ifTarget
						.data("if")
						.split(",")
						.map((item) => {
							let ifOperator = "==";

							let inputName = item.split(":")[0];
							let inputVal = item.split(":")[1];

							if ("!" == inputVal.charAt(0)) {
								ifOperator = "!=";

								inputVal = inputVal.substring(1);
							}

							if (
								!ifInputs.find(
									(ifInput) => ifInput == inputName
								)
							)
								ifInputs.push(inputName);

							return `({{${inputName}}} ${ifOperator} ${inputVal}) ${ifLogic} `;
						})
						.join("")
						.slice(0, -4);

					return {
						target: ifTarget,
						inputs: ifInputs,
						statement: ifStatement,
					};
				})
			);
		}
	};

	const handleIf = (fieldName, fieldVal) => {
		if (!fieldName) return;

		const listenersArr = listeners.filter((item) =>
			item.inputs.includes(fieldName)
		);

		if (listenersArr.length) {
			listenersArr.forEach((item) => {
				const targetResult = eval(
					item.statement.replaceAll(
						`{{${fieldName}}}`,
						`'${fieldVal}'`
					)
				);

				if (targetResult) item.target.show();
			});
		}
	};

	initialize();

	$("input,select,textarea").each(function () {
		handleIf(this.name, this.value);
	});

	$(document).on(
		"keydown",
		"input, textarea",
		debounce(function () {
			targets.hide();

			handleIf(this.name, this.value);
		}, 500)
	);

	$(document).on("change", "select", function () {
		targets.hide();

		handleIf(this.name, this.value);
	});
})();
