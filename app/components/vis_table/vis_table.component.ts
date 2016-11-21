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
	width: number;
	height: number;
	parseDate: Date;

	m = [80, 160, 0, 160]; // top right bottom left
    w = 1280 - this.m[1] - this.m[3]; // width
    h = 800 - this.m[0] - this.m[2]; // height
    x = D3.scale.linear().range([0, this.w]);
    y = 25; // bar height
    z = D3.scale.ordinal().range(["steelblue", "#aaa"]); // bar color

    hierachy: any;

	hierarchy = D3.layout.partition()
	    .value(function(d: any) { return d.size; });

	xAxis = D3.svg.axis()
	    .scale(this.x)
	    .orient("top");

	svg = D3.select("body").append("svg:svg")
	    .attr("width", this.w + this.m[1] + this.m[3])
	    .attr("height", this.h + this.m[0] + this.m[2])
	  .append("svg:g")
	    .attr("transform", "translate(" + this.m[3] + "," + this.m[0] + ")");


	constructor(private allServicesService: AllServicesService) {}

	ngOnInit() {
		this.getVis();
		this.ready();
	}

	getVis() {
		this.allServicesService.getVis().subscribe(
			res => {
				this.data = res;
				this.loading = false;
			},
			error => this.errorMessage = <any>error)
	}

	ready(){
		// console.log(D3.version);
		// D3.layout.partition();

		this.svg.append("svg:rect")
		    .attr("class", "background")
		    .attr("width", this.w)
		    .attr("height", this.h)
		    .on("click", this.up);

		this.svg.append("svg:g")
		    .attr("class", "x axis");

		this.svg.append("svg:g")
		    .attr("class", "y axis")
		  .append("svg:line")
		    .attr("y1", "100%");

		D3.json("/static/flare.json", function(root) {
		  this.hierarchy.nodes(root);
		  this.x.domain([0, root.value]).nice();
		  this.down(root, 0);
		});
	}

	down(d, i) {
	  if (!d.children) return;
	  var duration = D3.event && (<any>(D3.event)).altKey ? 7500 : 750,
	      delay = duration / d.children.length;

	  // Mark any currently-displayed bars as exiting.
	  var exit = this.svg.selectAll(".enter").attr("class", "exit");

	  // Entering nodes immediately obscure the clicked-on bar, so hide it.
	  exit.selectAll("rect").filter(function(p) { return p === d; })
	      .style("fill-opacity", 1e-6);

	  // Enter the new bars for the clicked-on data.
	  // Per above, entering bars are immediately visible.
	  var enter = this.bar(d)
	      .attr("transform", this.stack(i))
	      .style("opacity", 1);

	  // Have the text fade-in, even though the bars are visible.
	  // Color the bars as parents; they will fade to children if appropriate.
	  enter.select("text").style("fill-opacity", 1e-6);
	  enter.select("rect").style("fill", this.z("#aaa"));

	  // Update the x-scale domain.
	  this.x.domain([0, D3.max(d.children, function(d) { return d.value; })]).nice();

	  // Update the x-axis.
	  this.svg.selectAll(".x.axis").transition()
	      .duration(duration)
	      .call(this.xAxis);

	  // Transition entering bars to their new position.
	  var enterTransition = enter.transition()
	      .duration(duration)
	      .delay(function(d, i) { return i * delay; })
	      .attr("transform", function(d, i) { return "translate(0," + this.y * i * 1.2 + ")"; });

	  // Transition entering text.
	  enterTransition.select("text").style("fill-opacity", 1);

	  // Transition entering rects to the new x-scale.
	  enterTransition.select("rect")
	      .attr("width", function(d) { return this.x(d.value); })
	      .style("fill", function(d) { return this.z(!!d.children); });

	  // Transition exiting bars to fade out.
	  var exitTransition = exit.transition()
	      .duration(duration)
	      .style("opacity", 1e-6)
	      .remove();

	  // Transition exiting bars to the new x-scale.
	  exitTransition.selectAll("rect").attr("width", function(d) { return this.x(d.value); });

	  // Rebind the current node to the background.
	  this.svg.select(".background").data([d]).transition().duration(duration * 2); d.index = i;
	}

	up(d) {
	  if (!d.parent) return;
	  var duration = D3.event && D3.event.altKey ? 7500 : 750,
	      delay = duration / d.children.length;

	  // Mark any currently-displayed bars as exiting.
	  var exit = this.svg.selectAll(".enter").attr("class", "exit");

	  // Enter the new bars for the clicked-on data's parent.
	  var enter = this.bar(d.parent)
	      .attr("transform", function(d, i) { return "translate(0," + this.y * i * 1.2 + ")"; })
	      .style("opacity", 1e-6);

	  // Color the bars as appropriate.
	  // Exiting nodes will obscure the parent bar, so hide it.
	  enter.select("rect")
	      .style("fill", function(d) { return this.z(!!d.children); })
	    .filter(function(p) { return p === d; })
	      .style("fill-opacity", 1e-6);

	  // Update the x-scale domain.
	  this.x.domain([0, D3.max(d.parent.children, function(d) { return d.value; })]).nice();

	  // Update the x-axis.
	  this.svg.selectAll(".x.axis").transition()
	      .duration(duration * 2)
	      .call(this.xAxis);

	  // Transition entering bars to fade in over the full duration.
	  var enterTransition = enter.transition()
	      .duration(duration * 2)
	      .style("opacity", 1);

	  // Transition entering rects to the new x-scale.
	  // When the entering parent rect is done, make it visible!
	  enterTransition.select("rect")
	      .attr("width", function(d) { return this.x(d.value); })
	      .each("end", function(p) { if (p === d) D3.select(this).style("fill-opacity", null); });

	  // Transition exiting bars to the parent's position.
	  var exitTransition = exit.selectAll("g").transition()
	      .duration(duration)
	      .delay(function(d, i) { return i * delay; })
	      .attr("transform", this.stack(d.index));

	  // Transition exiting text to fade out.
	  exitTransition.select("text")
	      .style("fill-opacity", 1e-6);

	  // Transition exiting rects to the new scale and fade to parent color.
	  exitTransition.select("rect")
	      .attr("width", function(d) { return this.x(d.value); })
	      .style("fill", this.z(true));

	  // Remove exiting nodes when the last child has finished transitioning.
	  exit.transition().duration(duration * 2).remove();

	  // Rebind the current parent to the background.
	  this.svg.select(".background").data([d.parent]).transition().duration(duration * 2);
	}

	// Creates a set of bars for the given data node, at the specified index.
	bar(d) {
	  var bar = this.svg.insert("svg:g", ".y.axis")
	      .attr("class", "enter")
	      .attr("transform", "translate(0,5)")
	    .selectAll("g")
	      .data(d.children)
	    .enter().append("svg:g")
	      .style("cursor", function(d) { return !d.children ? null : "pointer"; })
	      .on("click", this.down);

	  bar.append("svg:text")
	      .attr("x", -6)
	      .attr("y", this.y / 2)
	      .attr("dy", ".35em")
	      .attr("text-anchor", "end")
	      .text(function(d) { return d.name; });

	  bar.append("svg:rect")
	      .attr("width", function(d) { return this.x(d.value); })
	      .attr("height", this.y);

	  return bar;
	}

	// A stateful closure for stacking bars horizontally.
	stack(i) {
	  var x0 = 0;
	  return function(d) {
	    var tx = "translate(" + x0 + "," + this.y * i * 1.2 + ")";
	    x0 += this.x(d.value);
	    return tx;
	  };
	}


}
