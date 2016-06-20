var app = angular.module('app', ['json-gui', 'json-gui-builder', 'ngFileUpload']).config(function(){
});
app.run(function(){

})

app.controller('modelController', function($scope, $timeout) {
    $scope.parseModelFromJson = function(url) {

        $.getJSON(url, function(data) {
            $scope.data = data;
        });
    }
    $scope.data = $scope.parseModelFromJson("json/wrf-arw.json");
});

app.controller('paramListControler', ['$scope', '$routeParams', '$http','dataTransfert', function($scope, $routeParams, $http, dataTransfert){

  $scope.parseParamFromJson = function(url) {
    $.getJSON(url, function(data) {
      $scope.data = data;
    });
  }
  dataTransfert.deleteCurrentParam();
  dataTransfert.setExpressions(new Array());
    $scope.data = dataTransfert.getData();
    console.log($scope.data);
    if( Object.keys($scope.data).length == 0)
      $scope.parseParamFromJson("json/wrf-arw.json");

  $scope.saveOnJson = function() {
    //var jsonData = angular.toJson($scope.data, true);
    //$http.post("http://localhost/JSONreception/JSONreception.php", jsonData).error(function(status){console.log(status)});;
    $http({method: 'POST', url: 'http://localhost/JSONreception/JSONreception.php', data: $scope.data}).
        then(function(response) {
          console.log(response.status);
          console.log(response.data);
        }, function(response) {
          console.log(response.data);
          console.log(response.status);
      });
  }

}]);

app.controller('paramController', function($scope, $location, dataTransfert){
	$scope.parametersCategories = dataTransfert.getCategories();
  $scope.paramObject = dataTransfert.getCurrentParamObject();
  $scope.dependencies = dataTransfert.getDependencies();

  $scope.goBack = function() {
    $location.path("/portalModels");
  }
  if(Object.keys($scope.paramObject)==0)
    $scope.goBack();
  // $scope.paramObject
});


app.controller('expreController', function($scope, $location, dataTransfert) {

  $scope.eval = [];
  $scope.currentParam = dataTransfert.getCurrentParamName();
  if($scope.currentParam.name==undefined)
    $location.path("/portalModels");
  $scope.expressions = dataTransfert.getExpressions();
  if($scope.expressions ==undefined) $scope.expressions = [];
  else {
    for(var i=0;i<$scope.expressions.length;i++)
      $scope.eval.push({evaluate:undefined});
  }
  $scope.dependenciesArr = dataTransfert.getSelectedDependencies();

  $scope.goBack = function() {
    dataTransfert.setExpressions(new Array());
    $location.path("/portalModels/parameter");
  }

  //ADD & DELETE FUNCTIONS///////////////////////////////////////////////////////////////////////////////////////////////////
  $scope.addExpression = function() {
    $scope.expressions.push({conditions:[], message:""});
    $scope.eval.push({evaluate:undefined});
  }

  $scope.deleteExpression = function(index) {
    $scope.expressions.splice(index, 1);
    $scope.eval.splice(index, 1);
    $scope.errorArr.splice(index, 1);
  }

  //ERROR MANAGEMENT FUNCTIONS///////////////////////////////////////////////////////////////////////////////////////////////

  $scope.errorArr = [];

  $scope.saveExpressions = function() {
    var ok = true;
    for (var i = 0; i < $scope.expressions.length; i++) {
       ok = ok && $scope.eval[i].evaluate();
    }
    if (ok) {
      dataTransfert.setExpressions($scope.expressions);
      $location.path('/portalModels/parameter');
    }
  }





});
