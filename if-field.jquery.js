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

							return `($('[name="${inputName}"]').val() ${ifOperator} ${inputVal}) ${ifLogic} `;
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
				const targetResult = eval(item.statement);

				if (targetResult) item.target.show();
				else item.target.hide();
			});
		}
	};

	const handleContent = (fieldName) => {
		const contentEl = $(`[data-content="${fieldName}"]`);
		const inputEl = $(`[name="${fieldName}"]`);

		if (!contentEl.length) return;

		if ("file" == inputEl.prop("type")) {
			handleIf(fieldName, inputEl.prop("value"));

			Object.values(inputEl.prop("files")).map((item) => {
				const prevURL = URL.createObjectURL(item);
				const prevImg = $(
					`<div class="if-field__image-prev">
                        <img class="if-field__image-prev-img" src="${prevURL}"/>
                        <div class="if-field__image-prev-holder"></div>
                    </div>`
				);

				contentEl.addClass("if-field__image-prevs").append(prevImg);
			});
		} else {
			contentEl.html(inputEl.val());
		}
	};

	initialize();

	$("input,select,textarea").each(function () {
		handleIf(this.name, this.value);
		handleContent(this.name);
	});

	$(document).on("keydown change", "input,select,textarea", function (evt) {
		if ("change" == evt.type) handleContent(this.name);
		else handleIf(this.name, this.value);
	});

	$(document).on(
		"keydown",
		"input, textarea",
		debounce(function () {
			handleIf(this.name, this.value);
		}, 500)
	);
})();
