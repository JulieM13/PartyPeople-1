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
	private errorMessage: string;
	private title = "Visualization";
	private data: any[];
	private loading = true;

	// D3 vars
	private margin = {top: 30, right: 120, bottom: 0, left: 120};
    private width = 960 - this.margin.left - this.margin.right;
    private height = 500 - this.margin.top - this.margin.bottom;

    private x = D3.scale.linear()
    	.range([0, this.width]);
	private barHeight = 20;
	private color = D3.scale.ordinal().range(["steelblue", "#ccc"]);
	private duration = 750;
	private delay = 25;
	private partition = D3.layout.partition()
		.value(function(d: any) { return d.size; });
	private xAxis = D3.svg.axis()
	    .scale(this.x)
	    .orient("top");
	private svg = D3.select("body").append("svg")
	    .attr("width", this.width + this.margin.left + this.margin.right)
	    .attr("height", this.height + this.margin.top + this.margin.bottom)
	  	.append("g")
	    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

	private end: number;
	private exit: any;
	private enter: any;
	private enterTransition: any;
	private exitTransition: any;
	private b: any;
	private tx: any;
	private x0: number;




	constructor(private allServicesService: AllServicesService) { }

	ngOnInit() {
		//this.getVis();

		this.svg.append("rect")
		    .attr("class", "background")
		    .attr("width", this.width)
		    .attr("height", this.height)
		    .on("click", this.up);

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


	public down = (d: any, i: any) => {
		if (!d.children) return;
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
		this.enter.select("rect").style("fill", this.color("#ccc"));

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
		fi = (d: any) => { 
			var exists = "steelblue";
			if (d.children){
				exists = "#ccc";
			}
			return this.color(exists); 
		}

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








	public up = (d) => {
	  if (!d.parent) return;
	  this.end = this.duration + d.children.length * this.delay;

	  // Mark any currently-displayed bars as exiting.
	  this.exit = this.svg.selectAll(".enter")
	      .attr("class", "exit");

	  var tra;
	  tra = (d, i) => { return "translate(0," + this.barHeight * i * 1.2 + ")"; }

	  // Enter the new bars for the clicked-on data's parent.
	  this.enter = this.bar(d.parent)
	      .attr("transform", tra)
	      .style("opacity", 1e-6);

	  var fi;
	  var filt;

	  fi = (d) => { 
	  	var exists = "steelblue";
			if (d.children){
				exists = "#ccc";
			}
			return this.color(exists);  
	  }
	  filt = (p) => { return p === d; }

	  // Color the bars as appropriate.
	  // Exiting nodes will obscure the parent bar, so hide it.
	  this.enter.select("rect")
	      .style("fill", fi)
	    .filter(filt)
	      .style("fill-opacity", 1);

	  var ma;
	  ma = (d) => { return d.value; }

	  // Update the x-scale domain.
	  this.x.domain([0, D3.max(d.parent.children, ma)]).nice();

	  // Update the x-axis.
	  this.svg.selectAll(".x.axis").transition()
	      .duration(this.duration)
	      .call(this.xAxis);

	  // Transition entering bars to fade in over the full duration.
	  this.enterTransition = this.enter.transition()
	      .duration(this.end)
	      .style("opacity", 1);

	  var wid;
	  var en;

	  wid = (d) => { return this.x(d.value); }
	  en = (p) => { if (p === d) D3.select("svg").style("fill-opacity", null); }

	  // Transition entering rects to the new x-scale.
	  // When the entering parent rect is done, make it visible!
	  this.enterTransition.select("rect")
	      .attr("width", wid)
	      .each("end", en);

	  var del;

	  del = (d, i) => { return i * this.delay; }

	  // Transition exiting bars to the parent's position.
	  this.exitTransition = this.exit.selectAll("g").transition()
	      .duration(this.duration)
	      .delay(del)
	      .attr("transform", this.stack(d.index));

	  // Transition exiting text to fade out.
	  this.exitTransition.select("text")
	      .style("fill-opacity", 1e-6);

	  // Transition exiting rects to the new scale and fade to parent color.
	  this.exitTransition.select("rect")
	      .attr("width", wid)
	      .style("fill", this.color("#ccc"));

	  // Remove exiting nodes when the last child has finished transitioning.
	  this.exit.transition()
	      .duration(this.end)
	      .remove();

	  // Rebind the current parent to the background.
	  this.svg.select(".background")
	      .datum(d.parent)
	    .transition()
	      .duration(this.end);
	}








	// Creates a set of bars for the given data node, at the specified index.
	public bar = (d) => {
	  this.b = this.svg.insert("g", ".y.axis")
	      .attr("class", "enter")
	      .attr("transform", "translate(0,5)")
	    .selectAll("g")
	      .data(d.children)
	    .enter().append("g")
	      .style("cursor", function(d: any) { 
	      	if(d.children == null) {
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
	public stack = (i) => {
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

