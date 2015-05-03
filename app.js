'use strict';

(function(){

angular.module('myBlog', ['ui.router'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise("/blog");
    $stateProvider
      .state('blog', {
        url:'/blog',
        views:{
          'header':{
              templateUrl: 'templates/header.html'
          },
          'left-main-content': {
              templateUrl: 'templates/left-main-content.html',
              controller: 'BlogController'
          },
          'right-main-content': {
              templateUrl: 'templates/right-main-content.html',
              controller: 'NavController'
          }
        }
      })
      .state('blog.article',{
        url: '/:article/:id',
        views:{
          'header':{
              templateUrl: 'templates/header.html'
          },
          'left-main-content@': {
              templateUrl: 'templates/left-article-content.html',
              controller: 'PostController'
          },
          'right-main-content': {
              templateUrl: 'templates/right-main-content.html',
              controller: 'NavController'
          }
        }
      })


}])

// initialize first run
.run(['$window','$rootScope', function($window, $rootScope){
  var blogs = $window.localStorage['blogs'];
  if(undefined === blogs){
    $window.localStorage.setItem('blogs', "[]");
    $rootScope.blogs = [];
  }

}])

//controllers
.controller('BlogController', ['Blogs','$rootScope', '$scope', function(Blogs, $rootScope, $scope){
  $scope.categories = ['travel','events','news','weather'];

  Blogs.getAll().then(function(data){
    $rootScope.blogs = data;
  });

  $scope.hasPosts = function(){
    return Blogs.hasPosts();
  }

  $scope.createPost = function(newpost){
    var date = new Date();
    var newpost = {
      title: newpost.title,
      content: newpost.content,
      author: newpost.author,
      date_posted: String(date).replace(/\sGMT.*/gi,""),
      likes: 0,
      comments: [],
      active: 0,
      pid: $rootScope.blogs.length
    }
    Blogs.save(newpost);
    $rootScope.blogs.push(newpost);
    this.newpost = {};
  }

}])

.controller('PostController', ['Blogs', '$scope','$stateParams','$rootScope', function(Blogs, $scope, $stateParams, $rootScope){
  var id = $stateParams.id;
  $scope.post = {};
  $scope.newcomment = "";
  $scope.comments = [];

  //console.log(Blogs.getComments(id));

  Blogs.getPost(id).then(function(data){
    $scope.post = data;
    $scope.comments = data.comments;
  });

  $scope.registerLikes = function(id){
    Blogs.registerLike(id);
  }

  $scope.registerComment = function(id, newcomment){
    var date = new Date();
    var comment = {
      content: newcomment,
      posted_date: String(date).replace(/\sGMT.*/gi,""),
      author: "anonymous",
      active: 1
    }
    Blogs.registerComment(id, comment);
    $scope.comments.push(comment);
    $scope.newcomment = "";
  }

}])

.controller('NavController', ['Blogs', '$rootScope', '$scope', function(Blogs, $rootScope, $scope){
  $scope.hasPost = function(){
    return Blogs.hasPosts();
  }

  Blogs.getAll().then(function(data){
    $rootScope.blogs = data;
  });

}])


//services
.factory('Blogs', ['$http', '$q', '$window', function($http, $q, $window){

	var saveLocalStorage = function(blogs){
	  $window.localStorage['blogs'] = angular.toJson(blogs);
	}
	var filterBlog = function(blogs, id){
		 for(var i=0, max = blogs.length; i < max; i++){
		    if(id == blogs[i].pid){
			return {id: blogs[i].pid, post: blogs[i]};
		    }
		}
		return {id:-1, post:{}};
	}
	var getBlogs = function(){
		return angular.fromJson($window.localStorage['blogs']);
	}

	return {
		getAll : function(){
			  var defered = $q.defer(), blogs = getBlogs();
			  defered.resolve(blogs);
			  return defered.promise;
		},
		save: function(post){
			  var blogs = getBlogs();
			  blogs.push(post);
			  saveLocalStorage(blogs);
		},
		hasPosts: function(){
		 	 return (angular.fromJson($window.localStorage['blogs']).length > 0) ? true : false;
		},
		getPost: function(id){
			  var defered = $q.defer(), blogs = getBlogs(), article = {};
	   		  article = filterBlog(blogs, id);
			  defered.resolve(article.post);
			  return defered.promise;
		},
		registerLike: function(id){
			  var blogs = getBlogs(), post = filterBlog(blogs, id);
	      	  	  blogs[post.id].likes += 1;
			  saveLocalStorage(blogs);
		},
		registerComment: function(id, newcomment){
			 var blogs = getBlogs(), post = filterBlog(blogs, id);
	   	         blogs[post.id].comments.push(newcomment);
			 saveLocalStorage(blogs);
		},
		getComments: function(id){
			  var defered = $q.defer(), blogs = getBlogs(), comments = [];
			  comments = blogs.filter(function(elem, index){
			      return (id == index) ? blogs[index].comments : [];
			  });
			  return comments;
		}
	}

}])

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
})


; //end


})();
