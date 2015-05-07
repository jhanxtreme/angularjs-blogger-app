'use strict';

(function(){

  angular.module('myBlog')

  .service('Comments', [ '$window', function($window){

      function getComments(){
        var blogs = angular.fromJson($window.localStorage['blogs']) || [], comments = [];
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

      var scope = this;
      scope.comments = getComments();
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


})();
