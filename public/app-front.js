(function () {

	var app = angular.module('app', ['ngRoute','ngAnimate']);

	app.config( function($routeProvider) {
		$routeProvider
			.when('/',
				{
					templateUrl: 'html/home.html',
					controller: 'MainController',
					controllerAs: 'main'
				}
			)
			.when('/user',
				{
					templateUrl: 'html/user.html',
					controller: 'MainController',
					controllerAs: 'main'
				}
			)
			.when('/user/john',
				{
					templateUrl: 'html/profile.html',
					controller: 'MainController',
					controllerAs: 'main'
				}
			)
			;
	});

	app.service('userDataService', function($http, $q) {
		var defferer = $q.defer();

		$http.get('/api/users/john')
			.success(function(data, status, headers, config) {
				defferer.resolve(data);
			});

		return defferer.promise ;
	});

	app.controller('MainController', function($scope, $compile, userDataService) {
		var self = this;

		self.subCategories = [];
		self.brands = [];
		self.currentCategory = '';

		function getCategories() {
			var barData = [];
			var catg = self.data.data;
			for (var i=0 ; i < catg.length ; i++) {
				barData.push([catg[i].category, catg[i].importance]);
			}
			return barData;
		}

		function getSubCategories(category) {
			// console.log('yeah again');
			var pieData = [];
			var currentObject = self.data.data.filter(function(obj) {return obj.category === category;})[0];
			// console.log(currentObject);
			var subs = currentObject.subCategories;
			// console.log(currentObject[0].subCategories);

			for (var i=0 ; i<subs.length ; i++) {
				pieData.push([subs[i].name, subs[i].importance]);
			}
			// console.log('pieData ' + pieData);
			return pieData;
		}

		function getBrands(category) {
			// if (category === null) {
			// 	return [];
			// }
			console.log(category);
			var currentObject = self.data.data.filter(function(obj) { return obj.category === category ;})[0];
			console.log(currentObject);
			return currentObject.topBrands;
			// var arr = self.data.data[0].topBrands;
			// return arr;
		}

		function getSubBrands(sub) {
			// console.log(self.currentCategory);
			var currentParent = self.data.data.filter(function(obj) { return obj.category===self.currentCategory; })[0];
			// console.log(currentParent);
			var currentObject = currentParent.subCategories.filter(function(obj) { return obj.name===sub; })[0];
			// console.log(currentObject.name);
			// console.log(currentParent[0].subCategories);
			return currentObject.topBrands;
		}

		userDataService.then(function (data) {
			self.data = data;
			self.barData = getCategories();
			// console.log(self.data.data[0].topBrands);
			// self.brands = getBrands(null);
			// console.log(self.brands);
		});

		self.setTopLevelBrands = function(category) {
			self.brands = getBrands(category);
			// console.log(self.brands);
			$scope.$apply();
		};

		self.setBrands = function(sub) {
			self.brands = getSubBrands(sub);
			$scope.$apply();
		};

		self.setPieData = function(category) {
			// console.log('yeah');
			self.subCategories = getSubCategories(category);
			// console.log(self.subCategories);
			$scope.$apply();
		};

		self.addPie = function(category) {
			self.setPieData(category);
			// console.log(self.subCategories);
			var elem = angular.element( document.querySelector('#vis') );
			// console.log(elem);
			var newDiv = $compile( '<div piechart   data="main.subCategories" >	</div>')( $scope );
			// var newDiv2 = $compile( '<div brandchart data="main.brands"></div>' )( $scope );
			// elem.append('<div piechart data="main.subCategories"></div>');
			elem.append(newDiv);
			// elem.append(newDiv2);
		};

		self.addBrandBar = function(category) {
			// self.setPieData(category);
			var elem = angular.element( document.querySelector('#vis') );
			var newDiv = $compile( '<div brandchart data="main.brands"></div>' )( $scope );
			elem.append(newDiv);
		};
	});


	app.directive('tab', function() {
		return {
			restrict: 'E',
			transclude: true,
			scope: {
				heading: '@'
			},
			require: '^tabset',
			template: '<div ng-show="active" ng-transclude></div>',

			link: function (scope, element, attrs, tabsetCtrl) {
				scope.active = false;
				tabsetCtrl.addTab(scope);
			}
		};
	});

	app.directive('tabset', function() {
		return {
			restrict: 'E',
			transclude: true,
			scope: {},
			
			templateUrl: 'html/tabset.html',
			bindToController: true,
			controllerAs: 'tabset',

			controller: function() {
				var self = this;
				self.tabs = [];

				self.addTab = function(tab) {
					self.tabs.push(tab);

					// if (self.tabs.length === 1) {
					// 	tab.active = true;
					// }
				};

				self.select = function(selectedTab) {
					angular.forEach(self.tabs, function(tab) {
						if (tab.active && tab !== selectedTab) {
							tab.active = false;
						}	
					});

					selectedTab.active = true;
				};
			}
		};
	});

	// do I still need $compile?
	app.directive('barchart', function($compile) {
		return {
			scope: {
				data: '='
			},
			require:"^ngController",
			link: function(scope, element, attrs, controller) {

				function sortFunction(a, b) {
				    if (a[1] === b[1]) { return 0; }
				    else { return (a[1] < b[1]) ? -1 : 1; }
				}

				function clickCategory(category) {
					controller.currentCategory = category;
					controller.setTopLevelBrands(category);

					// Show subcategory pie chart
					controller.setPieData(category);
					var elem1 = angular.element( document.querySelector('#pie') )[0];
					$(elem1).removeClass('ng-hide');

					var elem2 = angular.element( document.querySelector('#brands') )[0];
					$(elem2).removeClass('ng-hide');
				}

				var svg = d3.select(element[0])
							.append("svg")
							.attr('class', 'chart')
							.attr("height", 300)
							.attr("width", 600)
							;

				scope.render = function(data) {
					// var currentData = data.sort(sortFunction).reverse();
					// data = data.sort(sortFunction).reverse();

					svg.selectAll('rect').remove();
					svg.selectAll('text').remove();
					// var rect = svg.selectAll('rect').data(data);
					// var text = svg.selectAll('text').data(data);
					// rect.exit().remove();
					// text.exit().remove();

					svg.selectAll('rect')
					.data(data.sort(sortFunction).reverse())
					// rect
					.enter()
					.append('rect')
					.on('click', function(d) { clickCategory(d[0]); })
					.attr("height", "35")
					.attr("width", 0)
					.attr("x", 180)
					.attr("y", function(d,i) {return i* (35+4);})
					.style({
						"fill": "orange"
					})
					.transition()
					.duration(3000)
					.delay(1000)
					.attr("width", function(d) {return d[1]*3;})
					;

					svg.selectAll('text')
					.data(data)
					// text
					.enter()
					.append('text')
					.text( function(d) { return d[0]; })
					.attr({
						x: 10,
						y: function(d,i) { return (i * (35+4)) + 25 ; } ,
						"font-family": "Helvetica",
						"font-size": "16px",
						'fill': 'black',
						'text-anchor': 'left'
					})
					;
				
				};

				scope.$watch('data', function(){
					// console.log('data has changed!');
					// var data = scope.data.sort(sortFunction).reverse();
		        	scope.render(scope.data);
		        }, true);
			}
		};
	});

	app.directive('piechart', function() {
		return {
			scope: {
				data: '='
			},
			require:"^ngController",
			link: function (scope, element, attrs, controller) {

				// console.log(scope);

				// var dataset = scope.data;
				// console.log(dataset);


				var pie = d3.layout.pie().value(function(d) { return d[1]; });

				var arc = d3.svg.arc()
					.innerRadius(0)
					.outerRadius(100);

				var svg = d3.select(element[0])
					.append("svg")
					.attr("width", 600)
					.attr("height", 300);
				

				scope.render = function(data) {

					svg.selectAll('g.arc').remove();
					svg.selectAll('path').remove();
					svg.selectAll('text').remove();

					svg.selectAll('path').data(pie(data)).remove();

					var arcs = svg.selectAll("g.arc")
						.data(pie(data))
						.enter()
						.append("g")
						.attr("class", "arc")
						.attr("transform", "translate(" + 100 + ", " + 100 + ")")
						.on('click', function(d) {
							controller.setBrands(d.data[0]);
						});

					var color = d3.scale.category10();

					arcs.append("path")
						.attr("fill", function(d, i) { return color(i); })
						.attr("d", arc);

					arcs.append("text")
						.attr("transform", function(d) {
							return "translate(" + arc.centroid(d) + ")";
						})
						.attr("text-anchor", "middle")
						.text(function(d) {
							return d.data[0];
						});
				};

				scope.$watch('data', function(){
					// console.log('new!');
					// console.log(scope.data);
		        	scope.render(scope.data);
		        });
			}
		};
	});

	app.directive('brandchart', function() {
		return {
			scope: {
				data: '='
			},
			require: '^ngController',
			link: function (scope, element, attrs, controller) {
				// console.log(scope);

				function sortFunction(a, b) {
				    if (a[1] === b[1]) { return 0; }
				    else { return (a[1] < b[1]) ? -1 : 1; }
				}

				var svg = d3.select(element[0])
							.append("svg")
							// .attr('class', 'chart')
							.attr("height", 300)
							.attr("width", 600)
							;

				scope.render = function(data) {
					// console.log('rendering');

					svg.selectAll('rect').remove();
					svg.selectAll('text').remove();

					svg.selectAll('rect')
						.data(data.sort(sortFunction).reverse())
						// rect
						.enter()
						.append('rect')
						.on('click', function(d) { clickCategory(d[0]); })
						.attr("height", "35")
						.attr("width", 0)
						.attr("x", 180)
						.attr("y", function(d,i) {return i* (35+4);})
						.style({
							"fill": "orange"
						})
						.transition()
						.duration(3000)
						.delay(1000)
						.attr("width", function(d) {return d[1]*3;})
						;

					svg.selectAll('text')
						.data(data)
						// text
						.enter()
						.append('text')
						.text( function(d) { return d[0]; })
						.attr({
							x: 10,
							y: function(d,i) { return (i * (35+4)) + 25 ; } ,
							"font-family": "Helvetica",
							"font-size": "16px",
							'fill': 'black',
							'text-anchor': 'left'
						})
						;
				};

				scope.$watch('data', function(){
					// console.log('new!');
		        	scope.render(scope.data);
		        }, true);
			}
		};
	});

}) ();