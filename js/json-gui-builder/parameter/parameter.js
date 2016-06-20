builderModule.directive('parameterDir', ['$location','$timeout', 'dataTransfert', function($location,$timeout, dataTransfert){
	return {
		scope: {
			paramObject: '=',
			dependenciesArr: '=',
			categoryArr: '='
		},
		restrict: 'E',
		templateUrl: 'js/json-gui-builder/parameter/parameter.html',
		link: function(scope, iElm, iAttrs, controller) {
			//array with the types for which there is no validation
			scope.noValidationArray = ["fileupload", "domains", "text"];

			//INITIALIZATION//////////////////////////////////////////////////////////////////////////////////////

			//Main fields initialization
			if (scope.paramObject.parameterType != "") {
				scope.dataType = scope.paramObject.parameterType;
			}
			if (scope.paramObject.parameterCategory != undefined) {
				scope.parameterCategory = scope.paramObject.parameterCategory.toString();
			}

			var exprs = dataTransfert.getExpressions();
			if (exprs!=undefined && exprs.length!=0) {
				scope.paramObject.expressions = exprs;
			}

			var watcher = null;
			var addWatchForDomains = function() {
				watcher = scope.$watch('paramObject', function() {
							scope.paramObject.redraw();
							// scope.parameter.evaluate();
					}, true);
			};
			var removeWatchForDomains = function() {
				if(watcher!=null) watcher();//unbind
			}
			//Specific fields initialization
			switch (scope.paramObject.parameterType)
			{
				case 'fileupload':
					var unit = scope.paramObject.maxSize.slice(-2, scope.paramObject.maxSize.length);
					var value = scope.paramObject.maxSize.slice(0, scope.paramObject.maxSize.length-2)
					scope.maxSize = {maxSizeUnit: unit.toLowerCase(), maxSizeValue: value};
					break;
				case 'datetime':
					scope.hasDate = scope.paramObject.hasDate.toString();
					scope.hasTime = scope.paramObject.hasTime.toString();
					break;
				case 'domains':
					scope.onlyNested = scope.paramObject.onlyNested.toString();
					addWatchForDomains();
					break;
				default:
					break;
			}

			//Reset isValid property for the default value (Rebuild with save function)
			scope.paramObject.isValid = "";

			//REAL TIME UPDATE FUNCTIONS////////////////////////////////////////////////////////////////////////////

			scope.changeType = function() {
				scope.paramObject.value = "";
				//before changing the dataType I delete the property not used anymore
				switch (scope.paramObject.parameterType)
				{
					case 'fileupload':
						delete scope.paramObject.maxSize;
						delete scope.paramObject.maxUpload;
						delete scope.paramObject.minUpload;
						break;
					case 'datetime':
						delete scope.paramObject.hasDate;
						delete scope.paramObject.hasTime;
						break;
					case 'domains':
						delete scope.paramObject.center;
						delete scope.paramObject.mapZoom;
						delete scope.paramObject.onlyNested;
						delete scope.paramObject.maxDomains;
						delete scope.paramObject.maxMarkers;
						delete scope.paramObject.drawMarkers;
						delete scope.paramObject.drawDomains;
						delete scope.paramObject.required.domains;
					  delete scope.paramObject.required.markers;
						delete scope.paramObject.allowMarkersOutDomains;
						scope.paramObject.required = true;
						removeWatchForDomains();
						break;
					case 'select':
						delete scope.paramObject.values;
						break;
					default:
						break;
				}
				//I change the dataType property
				scope.paramObject.parameterType=scope.dataType;
				//And then i add the specific properties of the new dataType
				switch (scope.dataType)
				{
					case 'fileupload':
						scope.paramObject.value = [];
						scope.paramObject.maxSize = "3kb";
						scope.maxSize = {maxSizeUnit: "kb", maxSizeValue: '3'};
						scope.paramObject.maxUpload = 2;
						scope.paramObject.minUpload = 1;
						break;
					case 'datetime':
						scope.paramObject.hasDate = true;
						scope.hasDate = "true";
						scope.paramObject.hasTime = true;
						scope.hasTime = "true";
						break;
					case 'domains':
					scope.paramObject.value = {domains:{}, markers:{}};
						scope.paramObject.center = {"lat":44.496,"long":8.9209};
						scope.paramObject.mapZoom = 8;
						scope.paramObject.onlyNested = true;
						scope.onlyNested = "true";
						scope.paramObject.maxDomains = 3;
						scope.paramObject.maxMarkers = 3;
						scope.paramObject.drawMarkers = true;
					  scope.paramObject.drawDomains = true;
						scope.paramObject.required = {};
					  scope.paramObject.required.domains = true;
						scope.paramObject.required.markers = true;
						scope.paramObject.allowMarkersOutDomains = true;
						addWatchForDomains();
						break;
					case 'select':
						scope.paramObject.values = [];
						break;
					default:
						break;
				}
			}

			//fileupload specific field watcher
			scope.$watch('maxSize', function() {
				if (scope.maxSize != undefined) {
					scope.paramObject.maxSize = scope.maxSize.maxSizeValue.concat(scope.maxSize.maxSizeUnit);
				}
			}, true)

			scope.changeBooleanValue = function(value, property){
				if (value == "true") {
					scope.paramObject[property] = true;
				} else {
					scope.paramObject[property] = false;
				}
			}

			scope.boolToStr = function(arg) {return arg ? 'True' : 'False'};

			scope.convertToInteger = function(property){
				scope.paramObject[property] = parseInt(scope.paramObject[property]);
			}

			//Select type function
			scope.addOption = function() {
				scope.paramObject.values.push({name: "", value: scope.paramObject.values.length });
			}

			scope.delOption = function(index) {
				scope.paramObject.values.splice(index, 1);
				if(scope.paramObject.value==index)
					scope.paramObject.value = 0;
			}

			//DEPENDENCIES//////////////////////////////////////////////////////////////////////////////////////

			//Look for the display name in the dependencies array given to the directive
			scope.getDpName = function(varName) {
				for (var i = 0; i < scope.dependenciesArr.length; i++) {
					if (scope.dependenciesArr[i].dbName == varName) {
						return scope.dependenciesArr[i].displayName;
					}
				}
			}

			//Initialisation of the selected dependencies array with already selected dependencies
			$timeout(function(){
				scope.selectedDependencies = dataTransfert.getSelectedDepencies();
			} , 0);

			scope.addDependencie = function(string) {
				scope.checkDependencie(string);
				if (scope.dependencieError == 0) {
					scope.selectedDependencies.push(scope.dependenciesArr[scope.depenInd]);
					scope.paramObject.dependencies.push(scope.dependenciesArr[scope.depenInd].dbName)
				}
				scope.newDepen = "";
			}

			scope.delDependencie = function(index, string) {
				scope.selectedDependencies.splice(index, 1);
				for (i = 0; i < scope.paramObject.dependencies.length; i++) {
					if (scope.paramObject.dependencies[i] == string) {
						index = i;
					}
				}
				scope.paramObject.dependencies.splice(index, 1);
			}

			//CHECK FUNCTIONS////////////////////////////////////////////////////////////////////////////////////

			scope.dateOrTime = function() {
				if (scope.paramObject.hasDate == false && scope.paramObject.hasTime == false) {
					return true;
				} else {
					return false;
				}
			}

			scope.containsBlanks = function(string) {
				if (typeof string == "undefined") {
					return false;
				}
				if (string.indexOf(" ") != -1) {
					return true;
				} else {
					return false;
				}
			}

			scope.isPositive = function(value) {
				if (typeof value == undefined || isNaN(value)) {
					return true;
				}
				if (value < 0) {
					return true;
				} else {
					return false;
				}
			}

			scope.isStrictlyPositive = function(value) {
				if (typeof value == undefined || isNaN(value)) {
					return true;
				}
				if (value <= 0) {
					return true;
				} else {
					return false;
				}
			}

			scope.isLessThan = function(val1, val2) {
				if (val1 == "" || val2 == "") return false;
				if (val1 < val2) {
					return true;
				} else {
					return false;
				}
			}

			scope.checkDependencie = function(string) {
				scope.isADependencie = 0;
				scope.alreadyAdd = 0;
				//firt check if the string is well a dependencie
				for (i = 0; i < scope.dependenciesArr.length; i++) {
					if (scope.dependenciesArr[i].displayName == string) {
						scope.isADependencie = 1;
						scope.depenInd = i;
					}
				}
				if (scope.isADependencie != 1) {
					scope.dependencieError = 1;
					return;
				}
				//Second check if the dependencie is not already selected
				for (i = 0; i < scope.paramObject.dependencies.length; i++) {
					if (scope.paramObject.dependencies[i] == scope.dependenciesArr[scope.depenInd].dbName) {
						scope.alreadyAdd = 1;
					}
				}
				if (scope.alreadyAdd == 0) {
					scope.dependencieError = 0;
				} else {
					scope.dependencieError = 1;
				}
			}

			scope.checkSetting = function() {
				var valid = true;//returned value, change to false is something wrong
  				scope.errorArr = {};//stock the errors variables
  				if (scope.dataType == "" || scope.dataType == undefined) {
  					scope.errorArr.dataType = true;
  					valid = false;
  				} else {
  					scope.errorArr.dataType = false;
  				}
  				if (scope.paramObject.namelistName == "" || scope.paramObject.namelistName == undefined) {
					scope.errorArr.nameList = true;
					valid = false;
				} else {
					if (scope.containsBlanks(scope.paramObject.namelistName)) valid = false;
					scope.errorArr.nameList = false;
				}
				if (scope.parameterCategory == "" || scope.parameterCategory == undefined) {
					scope.errorArr.category = true;
					valid = false;
				} else {
					scope.errorArr.category = false;
				}
				//check specific values

				switch (scope.paramObject.parameterType)
				{
					case 'fileupload':
						scope.tooManyFiles = false;
						if (scope.isStrictlyPositive(scope.maxSize.maxSizeValue)) valid = false;
						if (scope.isStrictlyPositive(scope.paramObject.maxUpload)) valid = false;
						if (scope.isStrictlyPositive(scope.paramObject.minUpload)) valid = false;
						if (scope.isLessThan(scope.paramObject.maxUpload, scope.paramObject.minUpload)) valid = false;
						if (scope.isLessThan(scope.paramObject.maxUpload, scope.paramObject.value.length)){
							valid = false;
							scope.tooManyFiles = true;
						}
					break;
					case 'datetime':
						if (scope.dateOrTime()) valid = false;
					break;
					case 'domains':
						if (scope.isPositive(scope.paramObject.maxDomains)) valid = false;
						if (scope.isPositive(scope.paramObject.maxMarkers)) valid = false;
					break;
					case 'select':
						scope.selectNotValid = false;
						scope.optionNotValid = false;
						if(scope.paramObject.values.length==0) {
							valid = false;
							scope.selectNotValid = true;
						}
						for(var i=0;i<scope.paramObject.values.length;i++){
							if(scope.paramObject.values[i].name=="") {
								valid = false;
								scope.optionNotValid = true;
								break;
							}
						}
					default:
					break;
				}
				return valid;
  			}

			//SAVE FUNCTION///////////////////////////////////////////////////////////////////////////////////

			scope.goToExpression = function() {
				dataTransfert.setExpressions(scope.paramObject.expressions);
				dataTransfert.setSelectedDependencies(scope.selectedDependencies);
    			$location.path('/portalModels/expressions');
  			}

  			//Build the isValid property
  			scope.buildIsValid = function() {
					var res = "";
					var expression;
  				if (scope.paramObject.expressions!=undefined && scope.paramObject.expressions.length != 0) {
  					// res = "return function v(parameters, dependencies){var retObject = {};";
 	 				for (var i=0;i<scope.paramObject.expressions.length;i++) {
							expression = scope.paramObject.expressions[i];
  						if(i!=0) res += " else ";
							var isStatic, condition;
							for(var j=0;j<expression.conditions.length;j++) {
								if(j!=0) res+=" else ";
								res += " if(";

								condition = expression.conditions[j];
								isStatic = condition.val2.hasOwnProperty("isStatic");
								if(!isStatic) res += "dependencies['"+condition.val2.dbName+"']!=undefined && ";
								//val1
								if (condition.val1.dbName == scope.paramObject.dbName) {
	  							res += "parameter.value";
	  						} else {
									res += "dependencies['"+condition.val1.dbName+"']!=undefined && ";
									res += "dependencies['"+condition.val1.dbName+"'].value";
								}
								//operator
								res += ""+condition.operator+"";
								if(isStatic) {
									if(condition.val2.parameterType=="datetime"){
										res+= "moment('"+condition.val2.value+"').toDate();"
									}
									else res+= condition.val2.value;
								}
								else {
									res += "dependencies['"+condition.val2.dbName+"'].value";
								}
								res+= ") {retObject.valid= false;retObject.message = '"+expression.message+"';}";
							}

  					}
  				}
					scope.paramObject.isValid = res;
			}

			scope.saveParameter = function() {
				if (scope.checkSetting()) {
					scope.buildIsValid();
					 if(scope.noValidationArray.indexOf(scope.paramObject.parameterType)> -1){
						 delete scope.paramObject.expressions;
						 scope.paramObject.isValid = "";
					 }
					 scope.paramObject.parameterCategory = parseInt(scope.parameterCategory);
					dataTransfert.updateDataWithCurrentParam(scope.paramObject);
					// $location.path('/portalModels');
				}
			}
		}
	};
}]);
