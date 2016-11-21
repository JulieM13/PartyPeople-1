import { Component, OnInit } from '@angular/core';
import { AllServicesService } from '../../services/allServices.service';
import * as D3 from 'd3';

@Component({
    selector: 'vis-table',
    templateUrl: 'app/components/vis_table/vis_table.html',
    providers: [
    	AllServicesService
    ]
})

export class VisTableComponent implements OnInit {
	errorMessage: string;
	title = "Visualization";
	data: any[];
	loading = true;

	// D3 vars
	margin = {top: 30, right: 120, bottom: 0, left: 120};
    width = 960 - this.margin.left - this.margin.right;
    height = 500 - this.margin.top - this.margin.bottom;

    x = D3.scale.linear()
    	.range([0, this.width]);
	barHeight = 20;
	color = D3.scale.ordinal()
		.range(["steelblue", "#ccc"]);
	duration = 750;
	delay = 25;
	partition = D3.layout.partition()
		.value(function(d: any) { return d.size; });
	xAxis = D3.svg.axis()
	    .scale(this.x)
	    .orient("top");
	svg = D3.select("body").append("svg")
	    .attr("width", this.width + this.margin.left + this.margin.right)
	    .attr("height", this.height + this.margin.top + this.margin.bottom)
	  	.append("g")
	    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");




	constructor(private allServicesService: AllServicesService) { }

	ngOnInit() {
		// this.getVis();

		this.svg.append("rect")
		    .attr("class", "background")
		    .attr("width", this.width)
		    .attr("height", this.height)
		    .on("click", this.up);

		this.svg.append("g")
		    .attr("class", "x axis");

		this.svg.append("g")
		    .attr("class", "y axis")
		  	.append("line")
		    .attr("y1", "100%");

		D3.json("static/readme.json", function(error: any, root: any) {
			if (error) throw error;

			this.partition.nodes(root);
			this.x.domain([0, root.value]).nice();
			this.down(root, 0);
		});
	}


	down(d: any, i: any) {
		if (!d.children || this.__transition__) return;
		end = this.duration + d.children.length * this.delay;

		// Mark any currently-displayed bars as exiting.
		exit = this.svg.selectAll(".enter")
		  			   .attr("class", "exit");

		// Entering nodes immediately obscure the clicked-on bar, so hide it.
		exit.selectAll("rect").filter(function(p: any) { return p === d; })
		  .style("fill-opacity", 1e-6);

		// Enter the new bars for the clicked-on data.
		// Per above, entering bars are immediately visible.
		enter = this.bar(d)
		  .attr("transform", this.stack(i))
		  .style("opacity", 1);

		// Have the text fade-in, even though the bars are visible.
		// Color the bars as parents; they will fade to children if appropriate.
		enter.select("text").style("fill-opacity", 1e-6);
		enter.select("rect").style("fill", this.color(true));

		// Update the x-scale domain.
		this.x.domain([0, D3.max(d.children, function(d: any) { return d.value; })]).nice();

		// Update the x-axis.
		this.svg.selectAll(".x.axis").transition()
		  .duration(duration)
		  .call(xAxis);

		// Transition entering bars to their new position.
		enterTransition = enter.transition()
		  .duration(this.duration)
		  .delay(function(d: any, i: any) { return i * this.delay; })
		  .attr("transform", function(d: any, i: any) { return "translate(0," + this.barHeight * i * 1.2 + ")"; });

		// Transition entering text.
		enterTransition.select("text")
		  .style("fill-opacity", 1);

		// Transition entering rects to the new x-scale.
		enterTransition.select("rect")
		  .attr("width", function(d: any) { return this.x(d.value); })
		  .style("fill", function(d: any) { return this.color(!!d.children); });

		// Transition exiting bars to fade out.
		exitTransition = exit.transition()
		  .duration(this.duration)
		  .style("opacity", 1e-6)
		  .remove();

		// Transition exiting bars to the new x-scale.
		exitTransition.selectAll("rect")
		  .attr("width", function(d: any) { return this.x(d.value); });

		// Rebind the current node to the background.
		this.svg.select(".background")
		  .datum(d)
		.transition()
		  .duration(end);

		d.index = i;
	}














	// ********* CONVERT THE STUFF BELOW TO TYPESCRIPT ********** //

	function up(d) {
	  if (!d.parent || this.__transition__) return;
	  var end = duration + d.children.length * delay;

	  // Mark any currently-displayed bars as exiting.
	  var exit = svg.selectAll(".enter")
	      .attr("class", "exit");

	  // Enter the new bars for the clicked-on data's parent.
	  var enter = bar(d.parent)
	      .attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; })
	      .style("opacity", 1e-6);

	  // Color the bars as appropriate.
	  // Exiting nodes will obscure the parent bar, so hide it.
	  enter.select("rect")
	      .style("fill", function(d) { return color(!!d.children); })
	    .filter(function(p) { return p === d; })
	      .style("fill-opacity", 1e-6);

	  // Update the x-scale domain.
	  x.domain([0, d3.max(d.parent.children, function(d) { return d.value; })]).nice();

	  // Update the x-axis.
	  svg.selectAll(".x.axis").transition()
	      .duration(duration)
	      .call(xAxis);

	  // Transition entering bars to fade in over the full duration.
	  var enterTransition = enter.transition()
	      .duration(end)
	      .style("opacity", 1);

	  // Transition entering rects to the new x-scale.
	  // When the entering parent rect is done, make it visible!
	  enterTransition.select("rect")
	      .attr("width", function(d) { return x(d.value); })
	      .each("end", function(p) { if (p === d) d3.select(this).style("fill-opacity", null); });

	  // Transition exiting bars to the parent's position.
	  var exitTransition = exit.selectAll("g").transition()
	      .duration(duration)
	      .delay(function(d, i) { return i * delay; })
	      .attr("transform", stack(d.index));

	  // Transition exiting text to fade out.
	  exitTransition.select("text")
	      .style("fill-opacity", 1e-6);

	  // Transition exiting rects to the new scale and fade to parent color.
	  exitTransition.select("rect")
	      .attr("width", function(d) { return x(d.value); })
	      .style("fill", color(true));

	  // Remove exiting nodes when the last child has finished transitioning.
	  exit.transition()
	      .duration(end)
	      .remove();

	  // Rebind the current parent to the background.
	  svg.select(".background")
	      .datum(d.parent)
	    .transition()
	      .duration(end);
	}

	// Creates a set of bars for the given data node, at the specified index.
	function bar(d) {
	  var bar = svg.insert("g", ".y.axis")
	      .attr("class", "enter")
	      .attr("transform", "translate(0,5)")
	    .selectAll("g")
	      .data(d.children)
	    .enter().append("g")
	      .style("cursor", function(d) { return !d.children ? null : "pointer"; })
	      .on("click", down);

	  bar.append("text")
	      .attr("x", -6)
	      .attr("y", barHeight / 2)
	      .attr("dy", ".35em")
	      .style("text-anchor", "end")
	      .text(function(d) { return d.name; });

	  bar.append("rect")
	      .attr("width", function(d) { return x(d.value); })
	      .attr("height", barHeight);

	  return bar;
	}

	// A stateful closure for stacking bars horizontally.
	function stack(i) {
	  var x0 = 0;
	  return function(d) {
	    var tx = "translate(" + x0 + "," + barHeight * i * 1.2 + ")";
	    x0 += x(d.value);
	    return tx;
	  };

	// ********* CONVERT THE STUFF ABOVE TO TYPESCRIPT ********** //






	getVis() {
		//this.allServicesService.getVis().subscribe(
		//	res => {
		//		this.data = res;
		//		this.loading = false;
		//	},
		//	error => this.errorMessage = <any>error);
		console.log("Getting visualization data!");
	}

	
}

