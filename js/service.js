/**
*  Defines services
*/
angular.module('myModule', []).service('serviceTest', function(){
    var array, savedGraph, savedData;

  // Getter & setter for initialize and retrieve data
	this.set = function(data){
		savedData = data;
	};
	this.get = function(){
		return savedData;
	};


  // Getter & Setter for remediation simulation
  this.setArray = function(id_path, id_remed){
    array = [id_path, id_remed];
  };
  this.getArray = function(){
    return array;
  };

  this.setGraph = function(graph){
    savedGraph = graph;
  };
  this.getGraph = function(){
    return savedGraph;
  };

});

