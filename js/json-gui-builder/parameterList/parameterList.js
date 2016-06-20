builderModule.directive('parameterListDir', ['$location', 'dataTransfert', function($location, dataTransfert){
	return {
			scope: {
				data: '='
			},
			restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
			templateUrl: 'js/json-gui-builder/parameterList/parameterList.html',
		link: function(scope, iElm, iAttrs, controller) {
			var noDepsArray = ["text", "fileupload", "domains"];
			//PARAMETERS MANAGEMENT//////////////////////////////////////////////////////////////////////////////////////////////////
			scope.delParam = function(index) {
				scope.data.parameters.splice(index, 1);
			}

			scope.checkName = function(name) {
				scope.noName = false;
				scope.wrongName = false;
				//check if the user write something
				if (name == undefined || name == "") {
					scope.noName = true;
					return false;
				}
				//check if the name enter is not already used
				for (var i = 0; i < scope.data.parameters.length; i++) {
					if (scope.data.parameters[i].displayName == name) {
						scope.wrongName = true;
						return false;
					}
				}
				return true;
			}

			//BUILDING DATA FUNCTIONS/////////////////////////////////////////////////////////////////////////

			//Build and send the dependencies array
			scope.buildDependenciesArray = function(index) {
				scope.dependencies = [];
				var pars = scope.data.parameters;
  				for (var i = 0; i < pars.length; i++) {
  					//exclude the current parameter, but also the paraeters with a certain type.
  					if (i != index && noDepsArray.indexOf(pars[i].parameterType)<0) {
  						scope.dependencies.push(pars[i]);
  					}
  				}
  				dataTransfert.setDependencies(scope.dependencies);
			}

			scope.buildDbName = function(name) {
				return name.toLowerCase().split(' ').join('_')+""+Date.now();
			}

			//EVENT FUNCTIONS///////////////////////////////////////////////////////////////////////////////////

			scope.goToSetting = function(index) {
				scope.buildDependenciesArray(index);
				dataTransfert.setData(scope.data);
				dataTransfert.setCurrentParam(index);
				$location.path('/portalModels/parameter');
			}

			scope.validNewParam = function(name) {
				if (scope.checkName(name)) {
					scope.data.parameters.push({
						displayName: name,
						dbName: scope.buildDbName(name),
						parameterCategory:0,
						dependencies: [],
						computedResult:"(function(){return true;}())",
        				isValid: "return function v(parameters, dependencies){var retObject = {};retObject.valid= true;retObject.message=''; return retObject;}"
					});
					scope.newParam = false;
				}
			}

			var catAlreadyExistant = function(name){
				for(var i=0;i<scope.data.parametersCategories.length;i++){
					if(scope.data.parametersCategories[i].name===name) return true;
				}
				return false;
			}
			scope.addCategory = function(name) {
				if (name == undefined || name == "") {
					scope.noNameCat = true;
					return false;
				}
				if(catAlreadyExistant(name)){
					scope.wrongNameCat = true;
					return false;
				}
				scope.data.parametersCategories.push({name:name, value: scope.data.parametersCategories.length});
				console.log(scope.data.parametersCategories);
			};


		}
	};
}]);
