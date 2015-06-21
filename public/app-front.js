(function () {

	var app = angular.module('app', ['ngRoute', 'ui.bootstrap']);

	// router
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

	// service that gets the data from the server
	app.service('userDataService', function($http, $q) {
		var defferer = $q.defer();

		$http.get('/api/users/john')
			.success(function(data, status, headers, config) {
				defferer.resolve(data);
			});

		return defferer.promise ;
	});

	// app's controller
	app.controller('MainController', function($scope, userDataService) {
		var self = this;

		// accordion open toggle
		self.basicIsOpen = true;
		self.analysisIsOpen = true;

		// initialize some values
		self.subCategories = [];
		self.brands = [];
		self.currentCategory = '';
		self.barData = [];

		// promise has returned the data
		userDataService.then(function (data) {
			self.data = data;
		});

		// show visualization tab pane
		self.showViz = function() {
			// only show if it hasn't been shown already
			if (angular.element( document.querySelector('#bar') ).hasClass('ng-hide')) {
				angular.element( document.querySelector('#bar') ).removeClass('ng-hide');
				self.barData = getCategories();
			}
		};

		// gets and returns main categories
		function getCategories() {
			var barData = [];
			var catg = self.data.data;
			for (var i=0 ; i < catg.length ; i++) {
				barData.push([catg[i].category, catg[i].importance]);
			}
			return barData;
		}

		// populates pie chart data
		self.setPieData = function(category) {
			self.subCategories = getSubCategories(category);
			$scope.$apply();
		};

		// gets and returns pie chart data
		function getSubCategories(category) {
			var pieData = [];
			var currentObject = self.data.data.filter(function(obj) {return obj.category === category;})[0];
			var subs = currentObject.subCategories;

			for (var i=0 ; i<subs.length ; i++) {
				pieData.push([subs[i].name, subs[i].importance]);
			}

			return pieData;
		}

		// top brands for a category
		self.setTopLevelBrands = function(category) {
			self.brands = getBrands(category);
			$scope.$apply();
		};

		// gets and returns the top brands for a category
		function getBrands(category) {
			var currentObject = self.data.data.filter(function(obj) { return obj.category === category ;})[0];
			return currentObject.topBrands;
		}

		// top brands for a subcategory (when the pie chart has been clicked)
		self.setBrands = function(sub) {
			self.brands = getSubBrands(sub);
			$scope.$apply();
		};

		// get top brands for subcategory
		function getSubBrands(sub) {
			var currentParent = self.data.data.filter(function(obj) { return obj.category===self.currentCategory; })[0];
			var currentObject = currentParent.subCategories.filter(function(obj) { return obj.name===sub; })[0];
			return currentObject.topBrands;
		}

	});

	// initial barchart directive
	app.directive('barchart', function() {
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
					// var elem1 = angular.element( document.querySelector('#pie') )[0];
					// $(elem1).removeClass('ng-hide');
					var elem1 = angular.element( document.querySelector('#pie-container') );
					elem1.removeClass('ng-hide');

					// var elem2 = angular.element( document.querySelector('#brands') )[0];
					// $(elem2).removeClass('ng-hide');
					var elem2 = angular.element( document.querySelector('#brand-container') );
					elem2.removeClass('ng-hide');

					// var elem2 = angular.element( document.querySelector('#brands') );
					// elem2.removeClass('ng-hide');
				}

				var width = 900;
				var left_width = width / 2;
				// console.log(angular.element( document.querySelector('#bar') )[0].clientWidth);

				var svg = d3.select(element[0])
							.append("svg")
							.attr('class', 'chart')
							.attr("height", 300)
							.attr("width", '100%')
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
					.on("mouseover", function() {
						d3.select(this)
							.transition()
							.duration(150)
							.style({"fill": "#152737"});
					})
					.on("mouseout", function() {
						d3.select(this)
							.transition()
							.duration(150)
							.style({"fill": "#0F9FB4"});
					})
					.attr("height", "35")
					.attr("width", 0)
					.attr("x", '44%')
					.attr("y", function(d,i) {return i* (35+4);})
					.style({
						"fill": "#0F9FB4"
					})
					
					.transition()
					.duration(1200)
					.delay(120)
					.attr("width", function(d) {return d[1]*3;})

					;

					svg.selectAll('text')
					.data(data)
					// text
					.enter()
					.append('text')
					// .attr('class', 'bar-text')
					.text( function(d) { return d[0]; })
					.attr({
						x: "42%",
						y: function(d,i) { return (i * (35+4)) + 25 ; } ,
						"font-family": "Roboto Slab",
						"font-size": "16px",
						'fill': 'black',
						'text-anchor': 'end'
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

				var radius = 130;

				var arc = d3.svg.arc()
					.innerRadius(radius - 100)
					.outerRadius(radius);

				var arcLarge = d3.svg.arc()
				  .innerRadius(radius-100)
				  .outerRadius(radius + 20);

				var toggleArc = function(p){
					// return function() {
					// 	p.state = !p.state;
					//     var dest = p.state ? arcLarge : arc;

					//     d3.select(this).select("path").transition()
					//       .duration(500)
					//       .attr("d", dest)
					//       ;
					// };

					p.state = !p.state;
					    var dest = p.state ? arcLarge : arc;

					    d3.select(this).select("path").transition()
					      .duration(500)
					      .attr("d", dest)
					      ;


				    // d3.select('#tooltip').text(p.data[0]);

				    // d3.select("#tooltip")
				    //     .style("left", d3.event.pageX + "px")
				    //     .style("top", d3.event.pageY + "px")
				    //     .style("opacity", 1)
				    //     .select("#value")
				    //     .text(d.data[0]);
				};

				var width = 300, height = 500;

				var svg = d3.select(element[0])
					.append("svg")
					.attr("width", "100%")
					.attr("height", 400)
					.attr('viewBox','0 0 ' + Math.min(width,height) + ' ' + Math.min(width,height))
    				.attr('preserveAspectRatio','xMinYMin')
    				;
				

				scope.render = function(data) {

					svg.selectAll('g.arc').remove();
					svg.selectAll('path').remove();
					svg.selectAll('text').remove();

					svg.selectAll('path').data(pie(data)).remove();

					// function arcTween(a) {
					// 	var i = d3.interpolate(this._current, a);
					// 	// console.log('yes');
					// 	this._current = i(0);
					// 	return function(t) {
					// 		return arc(i(t));
					// 	};
					// }

					// var tweenPie = function (b) {
					// 	// console.log(b);
			  //         b.innerRadius = 0;
			  //         var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
			  //         return function(t) {
			  //           return arc(i(t));
			  //         };
			  //       };

					var arcs = svg.selectAll("g.arc")
						.data(pie(data))
						.enter()
						.append("g")
						.attr("class", "arc")
						.attr("transform", "translate(" + 200 + ", " + 150 + ")")
						.on('click', function(d) {
							controller.setBrands(d.data[0]);
						})
						// .on("mouseover", toggleArc)
						.on("mouseover", function(d) {
							d.state = !d.state;
						    var dest = d.state ? arcLarge : arc;

						    d3.select(this).select("path").transition()
						      .duration(500)
						      .attr("d", dest)
						      ;
							// toggleArc();
							d3.select('#tooltip')
							.style({"visibility": "visible"})
							.text(d.data[0]);
						})
						.on("mouseout", function(d) {
							d.state = !d.state;
						    var dest = d.state ? arcLarge : arc;

						    d3.select(this).select("path").transition()
						      .duration(500)
						      .attr("d", dest)
						      ;

						     // d3.select('#tooltip').attr("visibility");
						})
						;

					var color = d3.scale.category10();
					// var arcOver = d3.layout.arc().outerRadius(r + 10);

					arcs.append("path")
						// .on("mouseover", function() {
						// 	console.log('over');
						// 	// d3.select(this).attr("fill", "red");
						// 	d3.select(this).attr("d", arcOver);
						// })

						// .each(function(d) { this._current = d; })
						.transition()
						// .delay()
						.duration(1000)
						// .attrTween("d", arcTween)

						.attr("fill", function(d, i) { return color(i); })
						.attr("d", arc)
						
						
						// .ease("bounce")
						// .delay(function(d,i) { return i*500; })
						// .delay(500)
						

						
						;

					// var getAngle = function (d) {
					//     return (180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90);
					// };

					// arcs.append("text")
					// 	.attr("transform", function(d) {
					// 		// d.outerRadius = 320; // Set Outer Coordinate
					//   //       d.innerRadius = 315; // Set Inner Coordinate
					// 		return "translate(" + arc.centroid(d) + ")" + "rotate(" + getAngle(d) + ")";
					// 	})
					// 	// .attr("dy", 5)
					// 	.attr({
					// 		"text-anchor": "middle",
					// 		"font-family": "Roboto-Slab",
					// 		"fill": "white"
					// 	})
					// 	.text(function(d) {
					// 		return d.data[0];
					// 	});
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
							.attr("width", "100%")
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
						.attr("x", "30%")
						.attr("y", function(d,i) {return i* (35+4);})
						.style({
							"fill": "#0B717F"
						})
						.transition()
						.duration(1200)
						.delay(120)
						.attr("width", function(d) {return d[1]*3;})
						;

					svg.selectAll('text')
						.data(data)
						// text
						.enter()
						.append('text')
						.text( function(d) { return d[0]; })
						.attr({
							x: "27%",
							y: function(d,i) { return (i * (35+4)) + 25 ; } ,
							"font-family": "Roboto Slab",
							"font-size": "16px",
							'fill': 'black',
							'text-anchor': 'end'
						})
						;
				};

				scope.$watch('data', function(){
		        	scope.render(scope.data);
		        }, true);
			}
		};
	});

}) ();