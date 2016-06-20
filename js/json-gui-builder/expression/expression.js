builderModule.directive('expression',[ "dataTransfert", function(dataTransfert){
	return {
		scope: {
			expression: '=',
			dependenciesArr: '=',
			evaluate: '='
		},
		restrict: 'E',
		templateUrl: 'js/json-gui-builder/expression/expression.html',
		link: function(scope, element, attrs, controllers) {
			//Obtaining the whole current parameter object (not only the name)
			scope.parameter = dataTransfert.getCurrentParamObject();

			//Initialize operators
			var allOperators =  ['>', '<', '>=', '<=', '==', '!='];
			var selectOperators =  ['==', '!='];
			scope.operators = [];
			//library for static value of each parameter type
			scope.staticValues = []
			scope.staticValue = {};
			scope.staticValue.integer = {
				parameterType: "integer",
				value: undefined,
				required: true,
				disabled: false,
				displayName: "Static Value",
				dbName: "static_int",
				isValid: "",
				isStatic: true
			}
			scope.staticValue.float = {
				parameterType: "float",
				value: undefined,
				required: true,
				disabled: false,
				displayName: "Static Value",
				dbName: "static_float",
				isValid: "",
				isStatic: true
			}
			scope.staticValue.datetime = {
				parameterType: "datetime",
				value: undefined,
				required: true,
				disabled: false,
				displayName: "Static Value",
				dbName: "static_datetime",
				isValid: "",
				isStatic: true
			}
			scope.staticValue.select = {
				parameterType: "select",
				value: 0,
				required: true,
				disabled: false,
				displayName: "Static Value",
				dbName: "static_select",
				isValid: "",
				isStatic: true
			}

			scope.getDependIndex = function(varName) {
				for (var i = 0; i < scope.selectValArr.length; i++) {
					if (scope.selectValArr[i].dbName == varName) {
						return i;
					}
				}
				return "value";
			}
			//**********************Initialization*************************//
			//array for the first value of the condition.
			scope.selectValArr = [scope.parameter];//add the current Parrameter in the first place
			for (i =  0; i < scope.dependenciesArr.length; i++) {
				scope.selectValArr.push(scope.dependenciesArr[i]);
			}
			//no saved expression
			if(!scope.expression.hasOwnProperty("conditions") || scope.expression.conditions.length==0) {
				scope.operators.push(allOperators);
				scope.value1 = [""];
				scope.expression.conditions = [
					{
						val1:"",
						val2:"",
						operator:scope.operators[0][0]
					}
				];
				scope.staticValues.push(JSON.parse(JSON.stringify(scope.staticValue))); //for the first condition I put a clone of the staticValue object
				// scope.$watch('staticValues[0]', function() {
				// 	if (scope.val2=='') {
				// 		scope.expression.conditions[0].val2 = scope.staticValues[0][scope.expression.conditions[0].val1.parameterType];
				// 	}
				// }, true);
			}
			else {
				var condition;
				scope.value1 = [];
				for(var i=0; i<scope.expression.conditions.length;i++) {
					condition = scope.expression.conditions[i];
					scope.value1.push(condition.val1.dbName);
					scope.staticValues.push(JSON.parse(JSON.stringify(scope.staticValue)));
					if(condition.val2.hasOwnProperty('value'))
						scope.staticValues[i][condition.val2.parameterType].value = condition.val2.value;
					if(condition.val1.parameterType == 'select') {
						scope.operators.push(selectOperators);
						var indx = scope.getDependIndex(condition.val1.dbName);
						scope.staticValues[i][condition.val2.parameterType].values = scope.selectValArr[indx].values;
					}
					else scope.operators.push(allOperators);
				}
			}


			//Look for the index of the corresponding object in the selectable values array



			scope.changeVal1 = function(index) {

					var selIndex = scope.getDependIndex(scope.value1[index]);
					scope.expression.conditions[index].val1 = scope.selectValArr[selIndex];
					scope.operators[index] = allOperators;
					scope.expression.conditions[index].operator = allOperators[0];
					if(scope.expression.conditions[index].val1==undefined) return; //case "Choose Value" selected
					if(scope.expression.conditions[index].val2.hasOwnProperty("parameterType") || scope.expression.conditions[index].val2 == "static value") // if val2 was on staticValue, I have to change the value type
						scope.expression.conditions[index].val2 = scope.staticValues[index][scope.expression.conditions[index].val1.parameterType];
					if(scope.expression.conditions[index].val1.parameterType==="datetime") {
						scope.staticValues[index].datetime.hasDate = scope.val1Selected.hasDate;
						scope.staticValues[index].datetime.hasTime = scope.val1Selected.hasTime;
					}
					else if(scope.expression.conditions[index].val1.parameterType==="select") {
							scope.operators[index] = selectOperators;
							scope.expression.conditions[index].operator = selectOperators[0];

							scope.staticValues[index].select.values = scope.selectValArr[selIndex].values;
					}
			}

			////////////////////////////////////////////////////////////////////////////

			scope.changeVal2 = function(displayName, dbName, index) {
				if(displayName=="") {
					var type = scope.expression.conditions[index].val1;
					if(type==undefined || type.parameterType==undefined) scope.expression.conditions[index].val2 = "static value"; //if the first value is not highlighted, put a tmp string in val2
					else scope.expression.conditions[index].val2 = scope.staticValues[index][type.parameterType];
				}
				else scope.expression.conditions[index].val2 = dbName;

			}

			scope.getDisplayName = function(index){
				if(scope.expression.conditions[index].val2=="static value") return "Static Value";
				if(scope.expression.conditions[index].val2==undefined || scope.expression.conditions[index].val2=="") return "Choose Value"
				if(scope.expression.conditions[index].val2.displayName != undefined) return scope.expression.conditions[index].val2.displayName;
				var idx = scope.getDependIndex(scope.expression.conditions[index].val2)
				return scope.selectValArr[idx].displayName;
			}
			scope.addCondition = function() {
				var index = scope.operators.length;
				scope.operators.push(allOperators);
				scope.staticValues.push(JSON.parse(JSON.stringify(scope.staticValue)));
				scope.expression.conditions.push(
					{
						val1:"",
						val2:"",
						operator:scope.operators[scope.operators.length-1][0]
					}
				);

				// scope.$watch('staticValues['+index+']', function(){
				// 	if (scope.val2=='') {
				// 		scope.expression.conditions[index].val2 = scope.staticValues[index][scope.expression.conditions[index].val1.parameterType];
				// 	}
				// }, true);

			}

			scope.errors = {conditions:[], message:false}

			scope.evaluate.evaluate = function() {
				var ok = true;
				var cond;
				scope.errors.message = false;
				for(var i=0; i<scope.expression.conditions.length;i++) {
						cond = scope.expression.conditions[i];
						scope.errors.conditions[i] = {val1:false, val2:false};
						if(cond.val1 == undefined || cond.val1 == "") {
							scope.errors.conditions[i].val1 = true;
							ok = false;
						}
						if(cond.val2 == undefined || cond.val2=="") {
							scope.errors.conditions[i].val2 = true;
							ok = false;
						}
						else if(cond.val2.hasOwnProperty("parameterType") && (cond.val2.value==undefined || cond.val2.value=="") && cond.val2.value!==0) {
							scope.errors.conditions[i].val2 = true;
							ok = false;
						}
				}
				if(scope.expression.message=="") {
					scope.errors.message = true;
					ok = false;
				}
				return ok;
			}

		},
	};
}]);
