var Router = {


	/*
		* Router global instance 
		* Store all necessary property and method
  */

  mode: "history",

  currentPath: "/",

  storeRoutes: [],

  activePath: null,

  history: window.history,

  location: window.location,

  paramsKey: [],

  requestObject: {
    history,

    location,

    params: null,
    
  },

  // add route callback and route path
  add: function(path, callback) {

    this.storeRoutes = this.storeRoutes.concat({
      path: this.parseUrlPath(path),
      callback: callback
    });

  },

  // get route path and callback
  get: function(path, callback) {
    this.add(path, callback);
  },

  // listen everytime when path changed
  listen: function(state) {

  	// store current path and finded route
    var currentPath = this.location.pathname;
    var findRoute = this.computedRoutedIfExists(this.storeRoutes);

    /*
    	* if finded a route based on current location path then execute 
    	* the find route callback and set current request object
    */
    if (findRoute) {
    	
    	 // renew the requestobject
    	this.setRequestObject(findRoute.path);

    	// default callback
      findRoute.callback(this.requestObject);

     /* otherwise excute the default route callback w
     ith previouse request object */

    } else {

      var defaultRoute = this.storeRoutes.find(function(route) {
        return route.path === "*";
      });

      // default callback 
      defaultRoute.callback(this.requestObject);

    }
  },

 // Click hanlder for route-to directive
  routeHandler: function() {
    var self = this;

    document.addEventListener("click", function(e) {
      var path = e.target.getAttribute("route-to");

      if (path) {
        e.preventDefault();

        self.history.pushState(
          self.history.state,
          null,
          self.parseUrlPath(path)
        );
       self.listen();
      }
    });
  },

  /* When fist time Dom loaded then initialized this mehtod,  
  	/----  Recomend for all of us that invoke this method after the all invoke of 'Router.get()' method----/ 
  */
  initalized: function() {
  	var self = this;
    this.routeHandler();
    this.listen();

    // popstate listener
    window.addEventListener('popstate', function(event) {
    	self.listen();
		});

  },

  // push new path without new state and emmit listen method
  push: function(path, name = null) {
    this.history.pushState(
      this.history.state,
      name,
      this.parseUrlPath(path)
    );
    this.listen();
  },

  // push new path with new state and emmit listen method
  pushWithState: function(path, state, name = null) {
    this.history.pushState(state, name, this.parseUrlPath(path));
    this.listen();
  },

  // replace new path without new state and emmit listen method
  replace: function(path, name) {
    this.history.replaceState(
      this.history.state,
      name,
      this.parseUrlPath(path)
    );
     this.listen();
  },

   // Replace new path with new state and emmit listen method
  replaceWithState: function(path, state, name = null) {
    this.replaceState(state, name, this.parseUrlPath(path));
    this.listen();
  
  },

  // commputed existent route based current location path and return current route instance
  computedRoutedIfExists: function(routers, currentPath) {
    var currentPath = currentPath ? currentPath : this.location.pathname;
    var routers = routers ? routers : this.storeRoutes;
    var findRoute = null;


    for (var i = 0; i < routers.length; i++) {

      if (
        this.testCurrentPathWithRouterPath(
          routers[i].path,
          this.parseUrlPath(currentPath)
        )
      ) {
        findRoute = routers[i];
        break;
      }
    }
    return findRoute;
  },


  // Test route path with current path and return boolean
  testCurrentPathWithRouterPath: function(routePath, currentPath) {

    var self = this;
    var paramRegExp = /\/\:[a-z]+([0-9_]+)?/g;
    var matchParamsRegExp = "/([a-zA-Z0-9_\\:]+)";

    // Replace Route to path string as regular expresion based string
    var replacePathWithParamRegexp = routePath.replace(paramRegExp, function(
      match
    ) {
      self.paramsKey = self.paramsKey.concat(match.replace(/^\/\:/, ""));
      return matchParamsRegExp;
    });

    // Escape special characters
    replacePathWithParamRegexp = replacePathWithParamRegexp.replace(
      /\*/g,
      "\\*"
    );

    // return test result
    return new RegExp("^" + replacePathWithParamRegexp + "$").test(currentPath);
  },


  // Parse url path 
  parseUrlPath: function(path) {
    var path = path;

    if (path[path.length - 1] === "/" && path.length > 1) {
      path = path.replace(/\/$/, "");
    }

    path = path.replace(/[\/]+/g, "/");

    return path;
  },

  // Get paramse as object literal
  getMatchesParams: function(matahedRoutePath, currentPath) {
    var currentPath = currentPath ? currentPath : this.location.pathname;
 		return {};
  },

  // Set to request object everytime when execude the listener
  setRequestObject: function(matchedParams){

  		this.requestObject.replace = this.replace;
    	this.requestObject.push = this.push;
    	this.requestObject.pushWithState = this.pushWithState;
    	this.requestObject.replaceWithState = this.replaceWithState;
    	this.requestObject.params = this.getMatchesParams(matchedParams);
    	this.requestObject.query = this.parseUrlQuery(this.location.search);


  },
  parseUrlQuery: function(queryString){

  	var queryString = queryString ? queryString : this.location.search;
  	var queryObj = {};
  	if(queryString){

			// Make a valid stirng for json format
  		if(queryString.search(/^\?(\w+)?$/) > -1){
		  	return queryObj;
		  }
	  	if(queryString.search(/&(\w+)?$/) > -1){
		  	queryString = queryString.slice(0, queryString.search(/&(\w+)?$/)) ;
		  }

		  // Make search string to Json String
			queryString = queryString.slice(1);
	  	queryString = queryString.replace(/\&/g, '","');
	  	queryString = queryString.replace(/\=/g, '":"');

	   // parse json to object literal
	  	queryObj = JSON.parse('{"'+ queryString +'"}');

	  	for( var key in queryObj ) {

	  		// if object value still URI BASED then decode from URI based string
	  		var decodQueryValue = decodeURI(queryObj[key]);

	  		//  map key and value as same object literal
	  		queryObj[key] = decodQueryValue;

	  	}

	  	
  	}
  	return queryObj;
  }
};

var container = document.getElementById("container");

Router.get("/", function(req) {
		console.log(req);
  container.innerHTML = "<h1>Home</h1>";
});

Router.get("/about", function(req) {
		console.log(req);
  container.innerHTML = "<h1>About</h1>";
});

Router.get("/user", function(req) {
		console.log(req);
  container.innerHTML = "<h1>Users</h1>";
});

Router.get("/blog", function(req) {
		console.log(req);
  container.innerHTML = "<h1>Blog</h1>";
});

Router.get("/user/:id", function(req) {
	console.log(req);
  container.innerHTML = "<h1>User</h1>";
});

Router.get("/user/:userid/posts/:postid", function(req) {
		console.log(req);
  container.innerHTML = "<h1>User post</h1>";
});

Router.get("*", function(req) {
		console.log(req);
  container.innerHTML = "<h1>Page Not Found!! 404</h1>";
});

document
  .getElementById("homeRedirecHandler")
  .addEventListener("click", function() {
    Router.replace("/?name=shanto");
  });


Router.initalized();

