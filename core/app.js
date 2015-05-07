'use strict';

(function(){

angular.module('myBlog', ['ui.router'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise("/blog");
    $stateProvider
      .state('blog', {
        url:'/blog',
        views:{
          'left-content': {
              templateUrl: 'templates/left-content.html',
              controller: 'NavController'
          },
          'right-content': {
              templateUrl: 'templates/right-content.html',
              controller: 'BlogController'
          }
        }
      })
      .state('blog.article',{
        url: '/:article/:id',
        views:{
          'left-content@': {
              templateUrl: 'templates/left-content.html',
              controller: 'NavController'
          },
          'right-content@': {
              templateUrl: 'templates/right-article-content.html',
              controller: 'PostController'
          }
        }
      })


}])

// initialize first run
.run(['$window','$rootScope', function($window, $rootScope){
  var blogs = $window.localStorage['blogs'];
  if(undefined === blogs || !blogs.length){
    $window.localStorage.setItem("blogs", "[]");
    $rootScope.blogs = [];
  }

}]);

})();
