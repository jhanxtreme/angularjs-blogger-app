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

}])

//CONTROLLERS
.controller('BlogController', ['Blogs','$rootScope', '$scope', function(Blogs, $rootScope, $scope){
  $scope.categories = ['travel','events','news','weather'];
  $scope.newpost = {title:'', content:'', author:''};

  Blogs.getAll().then(function(data){
    $rootScope.blogs = data;
  });

  $scope.hasPosts = function(){
    return Blogs.hasPosts();
  }

  $scope.createPost = function(newpost){
    $scope.error = {};
    if(!newpost.title.length){
      $scope.error['title'] = "Title field is required.";
    }
    if(!newpost.content.length){
      $scope.error['content'] = "Content field is required.";
    }
    if(!newpost.author.length){
      $scope.error['author'] = "Author field is required.";
    }

    if($scope.error['title'] || $scope.error['content'] || $scope.error['author']){
      return false;
    }

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
    $scope.newpost = {};
  }

}])

.controller('PostController', ['Blogs', '$scope','$stateParams', function(Blogs, $scope, $stateParams){
  var id = $stateParams.id;
  $scope.post = {};
  $scope.newcomment = "";
  $scope.comments = [];

  Blogs.getPost(id).then(function(data){
    $scope.post = data;
    $scope.comments = data.comments;
  });

  $scope.registerLikes = function(id){
    Blogs.registerLike(id);
  }

  $scope.registerComment = function(id, newcomment){
    if(newcomment.trim().length){
        var date = new Date();
        var comment = {
          content: newcomment,
          posted_date: String(date).replace(/\sGMT.*/gi,""),
          author: "anonymous",
          active: 1
        }
        Blogs.registerComment(id, comment);
        $scope.comments.push(comment);
        this.newcomment = "";
    }
  }

  $scope.hasPost = function(obj){
    for(var key in obj){
      if(obj.hasOwnProperty(key)){
        return true;
      }
    }
    return false;
  }

}])

.controller('NavController', ['Blogs', '$rootScope', '$scope', function(Blogs, $rootScope, $scope){
  $scope.comments = Blogs.getComments();
  $scope.hasPosts = function(){
    return Blogs.hasPosts();
  }
  Blogs.getAll().then(function(data){
    $rootScope.blogs = data;
  });
}])


// SERVICES
.factory('Comments', ['$scope', function($scope){
    return{
        getAll: function(){
            var blogs = angular.fromJson($window.localStorage['blogs']) || [];
      			var comments = [];
      			if(blogs.length){
      	  			for(var i=0, max = blogs.length; i<max; i++){
        					for(var j=0, max2 = blogs[i].comments.length; j<max2; j++){
        						comments.push({
        							content: blogs[i].comments[j].content,
        							pid: blogs[i].pid,
        							post_title: blogs[i].title,
                      posted_date: blogs[i].comments[j].posted_date
        						});
        					}
      				}
      			}
      			return comments;
        }
    }
}])

.factory('Blogs', ['$http', '$q', '$window', function($http, $q, $window){

  	var saveLocalStorage = function(blogs){
  		$window.localStorage['blogs'] = angular.toJson(blogs);
  	};

  	var filterBlog = function(blogs, id){
  		for(var i=0, max = blogs.length; i < max; i++){
  			if(id == blogs[i].pid){
  				return {id: blogs[i].pid, post: blogs[i]};
  			}
  		}
  		return {id:-1, post:{}};
  	};

  	var getBlogs = function(){
  		return angular.fromJson($window.localStorage['blogs']) || [];
  	};

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
        		 	 return (getBlogs().length > 0) ? true : false;
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
        		getComment: function(id){
        			  var defered = $q.defer(), blogs = getBlogs(), comments = [];
        			  comments = blogs.filter(function(elem, index){
        			      return (id == index) ? blogs[index].comments : [];
        			  });
        			  return comments;
        		},
        		getComments: function(){
        			var defered = $q.defer();
        			var blogs = getBlogs();
        			var comments = [];
        			if(blogs.length){
        	  			for(var i=0, max = blogs.length; i<max; i++){
          					for(var j=0, max2 = blogs[i].comments.length; j<max2; j++){
          						comments.push({
          							content: blogs[i].comments[j].content,
          							pid: blogs[i].pid,
          							post_title: blogs[i].title,
                        posted_date: blogs[i].comments[j].posted_date
          						});
          					}
        				}
        			}
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
