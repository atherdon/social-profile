
var dataset = {
	shopping: 75,
	wellness: 56,
	food: 88,
	lifestyle: 23,
	media: 47,
	technology: 93,
	education: 41
};

function draw(data) {
	var svg = d3.select("#data-container")
				.append("svg")
				.attr({
					width: '500px',
					height: '150px'
				});

	// svg.selectAll("rect")
}