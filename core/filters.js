'use strict';

(function(){

  angular.module('myBlog')

  //filters
  .filter('reverse', function(){
    return function(items){
      if(items === undefined)
        return;
      else
        return items.slice().reverse();
    }

  })

  .filter('ucwords', function(){
      return function(input){
        return input.charAt(0).toUpperCase() + input.substr(1, input.length);
      }
  });


})();
