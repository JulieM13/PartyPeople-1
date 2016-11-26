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

	end: number;
	exit: any;
	enter: any;
	enterTransition: any;
	exitTransition: any;
	b: any;
	tx: any;
	x0: number;




	constructor(private allServicesService: AllServicesService) { }

	ngOnInit() {
		//this.getVis();

		this.svg.append("rect")
		    .attr("class", "background")
		    .attr("width", this.width)
		    .attr("height", this.height);

		this.svg.append("g")
		    .attr("class", "x-axis");

		this.svg.append("g")
		    .attr("class", "y-axis")
		  	.append("line")
		    .attr("y1", "100%");


		D3.json("/static/readme.json", this.updateJson);
		this.loading = false;
		//this.partition.nodes(this.data.value.children[0]);
	}

	public updateJson = (error: Error, root: any) => {
		if (error) throw error;

		console.log(root);
		console.log(this.title);
		this.partition.nodes(root);
		this.x.domain([0, root.value]).nice();
		this.down(root, 0);
	}


	down(d: any, i: any) {
		if (!d.children || !this.svg) return;
		this.end = this.duration + d.children.length * this.delay;

		// Mark any currently-displayed bars as exiting.
		this.exit = this.svg.selectAll(".enter")
		  			   .attr("class", "exit");

		var f;

		f = (p: any) => {
			return p === d;
		}

		// Entering nodes immediately obscure the clicked-on bar, so hide it.
		this.exit.selectAll("rect").filter(f).style("fill-opacity", 1e-6);

		// Enter the new bars for the clicked-on data.
		// Per above, entering bars are immediately visible.
		this.enter = this.bar(d)
		  .attr("transform", this.stack(i))
		  .style("opacity", 1);

		// Have the text fade-in, even though the bars are visible.
		// Color the bars as parents; they will fade to children if appropriate.
		this.enter.select("text").style("fill-opacity", 1e-6);
		this.enter.select("rect").style("fill", this.color("true"));

		var max;

		max = (d: any) => { return d.value; }

		// Update the x-scale domain.
		this.x.domain([0, D3.max(d.children, max)]).nice();

		// Update the x-axis.
		this.svg.selectAll(".x.axis").transition()
		  .duration(this.duration)
		  .call(this.xAxis);

		var trans;
		var del;

		del = (d: any, i: any) => { return i * this.delay; }
		trans = (d: any, i: any) => { return "translate(0," + this.barHeight * i * 1.2 + ")"; }

		// Transition entering bars to their new position.
		this.enterTransition = this.enter.transition()
		  .duration(this.duration)
		  .delay(del)
		  .attr("transform", trans);

		// Transition entering text.
		this.enterTransition.select("text")
		  .style("fill-opacity", 1);

		var wid;
		var fi;

		wid = (d: any) => { return this.x(d.value); }
		fi = (d: any) => { return this.color(d.children); }

		// Transition entering rects to the new x-scale.
		this.enterTransition.select("rect")
		  .attr("width", wid)
		  .style("fill", fi);

		// Transition exiting bars to fade out.
		this.exitTransition = this.exit.transition()
		  .duration(this.duration)
		  .style("opacity", 1e-6)
		  .remove();

		var ex;

		ex = (d: any) => { return this.x(d.value); }

		// Transition exiting bars to the new x-scale.
		this.exitTransition.selectAll("rect")
		  .attr("width", ex);

		// Rebind the current node to the background.
		this.svg.select(".background")
		  .datum(d)
		.transition()
		  .duration(this.end);

		d.index = i;
	}





	// Creates a set of bars for the given data node, at the specified index.
	bar(d) {
	  this.b = this.svg.insert("g", ".y.axis")
	      .attr("class", "enter")
	      .attr("transform", "translate(0,5)")
	    .selectAll("g")
	      .data(d.children)
	    .enter().append("g")
	      .style("cursor", function(d: any) { 
	      	if(d.children != null) {
	      		return null;
	      	}
	      	return "pointer";
	      })
	      .on("click", this.down);

	  this.b.append("text")
	      .attr("x", -6)
	      .attr("y", this.barHeight / 2)
	      .attr("dy", ".35em")
	      .style("text-anchor", "end")
	      .text(function(d: any) { return d.name; });

	  var re;

	  re = (d: any) => { return this.x(d.value); }

	  this.b.append("rect")
	      .attr("width", re)
	      .attr("height", this.barHeight);

	  return this.b;
	}

	// A stateful closure for stacking bars horizontally.
	stack(i) {
	  this.x0 = 0;

	  var tra;
	  tra = (d: any) => {
	    this.tx = "translate(" + this.x0 + "," + this.barHeight * i * 1.2 + ")";
	    this.x0 += this.x(d.value);
	    return this.tx;
	  }

	  return tra;
	}











	getVis() {
		this.allServicesService.getVis().subscribe(
			res => {
				this.data = res;
				this.loading = false;
				console.log(this.data);
			},
			error => this.errorMessage = <any>error);
		console.log("Getting visualization data!");
	}

	
}

