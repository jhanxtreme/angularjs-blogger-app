'use strict';

(function(){

angular.module('myBlog')

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
        $scope.newpost = {title:'', content:'', author:''};
        $scope.error = {};
      }

    }])



    .controller('PostController', ['Blogs', 'Comments', '$scope','$stateParams', function(Blogs,Comments, $scope, $stateParams){
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
            /* update comments from the right cotent */
            $scope.comments.push(comment);
            /* update comments from the left content */
            Comments.comments.push(comment);
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



    .controller('NavController', ['Blogs','Comments', '$rootScope', '$scope', function(Blogs,Comments, $rootScope, $scope){
      $scope.comments = Comments.comments;
      $scope.hasPosts = function(){
        return Blogs.hasPosts();
      }
      Blogs.getAll().then(function(data){
        $rootScope.blogs = data;
      });
    }])

})();
