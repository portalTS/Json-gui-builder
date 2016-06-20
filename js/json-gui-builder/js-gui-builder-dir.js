var builderModule = angular.module('json-gui-builder', ['ngRoute']);

builderModule.config(['$routeProvider',function($routeProvider) {
	$routeProvider
	.when('/portalModels/parameter', {
		templateUrl: 'js/json-gui-builder/parameterLink.html',
		controller: 'paramController'
	})
	.when('/portalModels/expressions', {
		templateUrl: 'js/json-gui-builder/expressionLink.html',
		controller: 'expreController'
	})
	.when('/portalModels', {
		templateUrl: 'js/json-gui-builder/parameterListLink.html',
		controller: 'paramListControler'
	})
	.otherwise({
		redirectTo: '/portalModels'
	});
}]);

builderModule.service('dataTransfert', function(){

	//the entier data extract from the json file
	var data = {};

	//the index of the current parameter
	var currentParamIndex;

	//A copy of the current parameter
	var currentParamObject = {};

	//the full dependencies array (displayName + dbName)
	var dependencies = [];
	var selectedDependencies = [];
	var expressions = [];
	//DATA'S METHODS//////////////////////////////////////////////////////////////////////////

	var setData = function(obj) {
		data = obj;
	}

	var getData = function() {
		return data;
	}

	var getCategories = function() {
		return data.parametersCategories;
	}

	//CURRENT PARAMETER'S METHODS//////////////////////////////////////////////////////////////

	var setCurrentParam = function(index) {
		currentParamIndex = index;
		angular.copy(data.parameters[index], currentParamObject);
	}

	var getCurrentParamObject = function() {
		return currentParamObject;
	}

	var getCurrentParamName = function() {
		return {name: currentParamObject.displayName, varName: currentParamObject.dbName};
	};

	var setExpressions = function(obj) {
		angular.copy(obj, expressions);
		for(var i=0; i<expressions.length;i++){
			for(var j=0;j<expressions[i].conditions.length;j++){
					delete expressions[i].conditions[j].val1.computedResult;
					delete expressions[i].conditions[j].val1.isValid;
					delete expressions[i].conditions[j].val1.dependencies;
					delete expressions[i].conditions[j].val1.required;

					delete expressions[i].conditions[j].val1.evaluate;
					delete expressions[i].conditions[j].val1.parameterCategory;

					delete expressions[i].conditions[j].val2.computedResult;
					delete expressions[i].conditions[j].val2.isValid;
					delete expressions[i].conditions[j].val2.evaluate;
					delete expressions[i].conditions[j].val2.dependendencies;
					delete expressions[i].conditions[j].val2.required;

					delete expressions[i].conditions[j].val1.disabled;
					delete expressions[i].conditions[j].val1.value;
					delete expressions[i].conditions[j].val2.disabled;

			}
		}
	};

	var getExpressions = function() {
		var obj = new Array();
		angular.copy(expressions, obj);
		return obj;
	};

	var updateDataWithCurrentParam = function(obj) {
		data.parameters[currentParamIndex] = obj;
		//clear the parameter updated
		// currentParamObject = {};
	}
	var deleteCurrentParam = function(){
		currentParamObject = {};
	}
	//DEPENDENCIES' METHODS////////////////////////////////////////////////////////////////////

	var setDependencies = function(arr) {
		dependencies = arr;
	};

	var getDependencies = function() {
		return dependencies;
	};

	var setSelectedDependencies = function(deps) {
		selectedDependencies = deps;
	}

	var getSelectedDependencies = function() {
		return selectedDependencies;
	}

	var getSelectedDepencies= function() {
		var selectedDepArr = [];
		for (var i = 0; i < currentParamObject.dependencies.length; i++) {
			for (var j = 0; j < dependencies.length; j++) {
				if (dependencies[j].dbName == currentParamObject.dependencies[i]) {
					selectedDepArr.push(dependencies[j]);
				}
			}
		}
		return selectedDepArr;
	}

	return {
		setData: setData,
		getData: getData,
		getCategories: getCategories,
		setCurrentParam: setCurrentParam,
		getCurrentParamObject: getCurrentParamObject,
		getCurrentParamName: getCurrentParamName,
		setExpressions: setExpressions,
		getExpressions: getExpressions,
		updateDataWithCurrentParam: updateDataWithCurrentParam,
		setDependencies: setDependencies,
		getDependencies: getDependencies,
		getSelectedDepencies : getSelectedDepencies,
		getSelectedDependencies: getSelectedDependencies,
		setSelectedDependencies: setSelectedDependencies,
		deleteCurrentParam: deleteCurrentParam
	};
});
