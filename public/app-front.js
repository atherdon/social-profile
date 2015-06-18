(function () {

	var app = angular.module('app', []);

	app.controller('MainController', function() {
		var self = this;

		self.something = "Hello world";
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

	app.directive('barchart', function() {
		return {
			restrict: 'E',
			replace: false,
			scope: {},
			link: function(scope, element) {
				var dataset = [ 
					["Shopping", 45],
					["Wellness & Health", 25],
					["Food & Beverage", 10], 
					["Lifestyle", 70], 
					["Media & Entertainment", 64], 
					["Technology", 98], 
					["Education", 25]
				];

				var svg = d3.select(element[0])
							.append("svg")
							.attr('class', 'chart')
							.attr("height", 300)
							;

				svg.selectAll('rect')
					.data(dataset)
					.enter()
					.append('rect')
					.attr("height", "35")
					.attr("width", 0)
					.attr("x", 0)
					.attr("y", function(d,i) {return i* (35+4);})
					.style({
						"fill": "orange"
					})
					.transition()
					.duration(3000)
					.delay(1000)
					.attr("width", function(d) {return d[1]*3;})
					.text(function(d) {return d[0];})
					;
			}
		};
		
	});

}) ();