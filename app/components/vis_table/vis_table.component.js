"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var allServices_service_1 = require('../../services/allServices.service');
var D3 = require('d3');
var VisTableComponent = (function () {
    function VisTableComponent(allServicesService) {
        var _this = this;
        this.allServicesService = allServicesService;
        this.title = "Visualization";
        this.loading = true;
        // D3 vars
        this.margin = { top: 30, right: 120, bottom: 0, left: 120 };
        this.width = 1280 - this.margin.left - this.margin.right;
        this.height = 700 - this.margin.top - this.margin.bottom;
        this.x = D3.scale.linear()
            .range([0, this.width]);
        this.barHeight = 20;
        this.color = D3.scale.ordinal().range(["steelblue", "#ccc"]);
        this.duration = 750;
        this.delay = 25;
        this.partition = D3.layout.partition()
            .value(function (d) { return d.size; });
        this.xAxis = D3.svg.axis()
            .scale(this.x)
            .orient("top");
        this.svg = D3.select("body").append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        this.updateJson = function (error, root) {
            if (error)
                throw error;
            console.log(root);
            console.log(_this.title);
            _this.partition.nodes(root);
            _this.x.domain([0, root.value]).nice();
            _this.down(root, 0);
        };
        this.down = function (d, i) {
            if (!d.children)
                return;
            _this.end = _this.duration + d.children.length * _this.delay;
            // Mark any currently-displayed bars as exiting.
            _this.exit = _this.svg.selectAll(".enter")
                .attr("class", "exit");
            var f;
            f = function (p) {
                return p === d;
            };
            // Entering nodes immediately obscure the clicked-on bar, so hide it.
            _this.exit.selectAll("rect").filter(f).style("fill-opacity", 1e-6);
            // Enter the new bars for the clicked-on data.
            // Per above, entering bars are immediately visible.
            _this.enter = _this.bar(d)
                .attr("transform", _this.stack(i))
                .style("opacity", 1);
            // Have the text fade-in, even though the bars are visible.
            // Color the bars as parents; they will fade to children if appropriate.
            _this.enter.select("text").style("fill-opacity", 1e-6);
            _this.enter.select("rect").style("fill", _this.color("#ccc"));
            var max;
            max = function (d) { return d.value; };
            // Update the x-scale domain.
            _this.x.domain([0, D3.max(d.children, max)]).nice();
            // Update the x-axis.
            _this.svg.selectAll(".x.axis").transition()
                .duration(_this.duration)
                .call(_this.xAxis);
            var trans;
            var del;
            del = function (d, i) { return i * _this.delay; };
            trans = function (d, i) { return "translate(0," + _this.barHeight * i * 1.2 + ")"; };
            // Transition entering bars to their new position.
            _this.enterTransition = _this.enter.transition()
                .duration(_this.duration)
                .delay(del)
                .attr("transform", trans);
            // Transition entering text.
            _this.enterTransition.select("text")
                .style("fill-opacity", 1);
            var wid;
            var fi;
            wid = function (d) { return _this.x(d.value); };
            fi = function (d) {
                var exists = "steelblue";
                if (d.children) {
                    exists = "#ccc";
                }
                return _this.color(exists);
            };
            // Transition entering rects to the new x-scale.
            _this.enterTransition.select("rect")
                .attr("width", wid)
                .style("fill", fi);
            // Transition exiting bars to fade out.
            _this.exitTransition = _this.exit.transition()
                .duration(_this.duration)
                .style("opacity", 1e-6)
                .remove();
            var ex;
            ex = function (d) { return _this.x(d.value); };
            // Transition exiting bars to the new x-scale.
            _this.exitTransition.selectAll("rect")
                .attr("width", ex);
            // Rebind the current node to the background.
            _this.svg.select(".background")
                .datum(d)
                .transition()
                .duration(_this.end);
            d.index = i;
        };
        this.up = function (d) {
            if (!d.parent)
                return;
            _this.end = _this.duration + d.children.length * _this.delay;
            // Mark any currently-displayed bars as exiting.
            _this.exit = _this.svg.selectAll(".enter")
                .attr("class", "exit");
            var tra;
            tra = function (d, i) { return "translate(0," + _this.barHeight * i * 1.2 + ")"; };
            // Enter the new bars for the clicked-on data's parent.
            _this.enter = _this.bar(d.parent)
                .attr("transform", tra)
                .style("opacity", 1e-6);
            var fi;
            var filt;
            fi = function (d) {
                var exists = "steelblue";
                if (d.children) {
                    exists = "#ccc";
                }
                return _this.color(exists);
            };
            filt = function (p) { return p === d; };
            // Color the bars as appropriate.
            // Exiting nodes will obscure the parent bar, so hide it.
            _this.enter.select("rect")
                .style("fill", fi)
                .filter(filt)
                .style("fill-opacity", 1);
            var ma;
            ma = function (d) { return d.value; };
            // Update the x-scale domain.
            _this.x.domain([0, D3.max(d.parent.children, ma)]).nice();
            // Update the x-axis.
            _this.svg.selectAll(".x.axis").transition()
                .duration(_this.duration)
                .call(_this.xAxis);
            // Transition entering bars to fade in over the full duration.
            _this.enterTransition = _this.enter.transition()
                .duration(_this.end)
                .style("opacity", 1);
            var wid;
            var en;
            wid = function (d) { return _this.x(d.value); };
            en = function (p) { if (p === d)
                D3.select("svg").style("fill-opacity", null); };
            // Transition entering rects to the new x-scale.
            // When the entering parent rect is done, make it visible!
            _this.enterTransition.select("rect")
                .attr("width", wid)
                .each("end", en);
            var del;
            del = function (d, i) { return i * _this.delay; };
            // Transition exiting bars to the parent's position.
            _this.exitTransition = _this.exit.selectAll("g").transition()
                .duration(_this.duration)
                .delay(del)
                .attr("transform", _this.stack(d.index));
            // Transition exiting text to fade out.
            _this.exitTransition.select("text")
                .style("fill-opacity", 1e-6);
            // Transition exiting rects to the new scale and fade to parent color.
            _this.exitTransition.select("rect")
                .attr("width", wid)
                .style("fill", _this.color("#ccc"));
            // Remove exiting nodes when the last child has finished transitioning.
            _this.exit.transition()
                .duration(_this.end)
                .remove();
            // Rebind the current parent to the background.
            _this.svg.select(".background")
                .datum(d.parent)
                .transition()
                .duration(_this.end);
        };
        // Creates a set of bars for the given data node, at the specified index.
        this.bar = function (d) {
            _this.b = _this.svg.insert("g", ".y.axis")
                .attr("class", "enter")
                .attr("transform", "translate(0,5)")
                .selectAll("g")
                .data(d.children)
                .enter().append("g")
                .style("cursor", function (d) {
                if (d.children == null) {
                    return null;
                }
                return "pointer";
            })
                .on("click", _this.down);
            _this.b.append("text")
                .attr("x", -6)
                .attr("y", _this.barHeight / 2)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function (d) { return d.name; });
            var re;
            re = function (d) { return _this.x(d.value); };
            _this.b.append("rect")
                .attr("width", re)
                .attr("height", _this.barHeight);
            return _this.b;
        };
        // A stateful closure for stacking bars horizontally.
        this.stack = function (i) {
            _this.x0 = 0;
            var tra;
            tra = function (d) {
                _this.tx = "translate(" + _this.x0 + "," + _this.barHeight * i * 1.2 + ")";
                _this.x0 += _this.x(d.value);
                return _this.tx;
            };
            return tra;
        };
    }
    VisTableComponent.prototype.ngOnInit = function () {
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
        D3.json("/static/schools.json", this.updateJson);
        this.loading = false;
        //this.partition.nodes(this.data.value.children[0]);
    };
    VisTableComponent.prototype.getVis = function () {
        var _this = this;
        this.allServicesService.getVis().subscribe(function (res) {
            _this.data = res;
            _this.loading = false;
            console.log(_this.data);
        }, function (error) { return _this.errorMessage = error; });
        console.log("Getting visualization data!");
    };
    VisTableComponent = __decorate([
        core_1.Component({
            selector: 'vis-table',
            templateUrl: 'app/components/vis_table/vis_table.html',
            providers: [
                allServices_service_1.AllServicesService
            ],
            styleUrls: ['app/components/vis_table/vis_table.css'],
            encapsulation: core_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [allServices_service_1.AllServicesService])
    ], VisTableComponent);
    return VisTableComponent;
}());
exports.VisTableComponent = VisTableComponent;
//# sourceMappingURL=vis_table.component.js.map