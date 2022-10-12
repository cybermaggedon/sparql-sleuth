
import {
    Component, OnInit, Input, ViewChild, ElementRef
} from '@angular/core';
import * as d3 from 'd3';
import { interval } from 'rxjs';
import { take } from 'rxjs';

@Component({
  selector: 'graph',
  templateUrl: './graph.component.svg',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

    private margin = 50;
    private width = 1000 - (this.margin * 2);
    private height = 1000 - (this.margin * 2);

    @Input("data") data : string[][] = [];

    @ViewChild("graph") graphElement? : ElementRef = undefined;
    
    private svgElement? : any = undefined; // FIXME: Type HTMLElement?

    simulator : any;
    cnt : number = 5;

    nodes : any[] = [];
    links : any [] = [];

    tick() : void {
	this.cnt += 1;
	this.simulator.tick();
    }

    constructor() {
	this.cnt = 5;

	this.nodes = [
	    {
		x: 4, y: 6, vx: 0, vy: 0, label: "a",
	    },
	    {
		x: 1.01, y: 6.01, vx: 0, vy: 0, label: "b",
	    },
	    {
		x: 2.03, y: 2.03, vx: 0, vy: 0, label: "c",
	    },
	    {
		x: 2.03, y: 2.03, vx: 0, vy: 0, label: "d",
	    }
	];

	this.links = [
	    {
		source: 0, target: 1
	    },
	    {
		source: 1, target: 2
	    },
	    {
		source: 1, target: 3
	    },
	    {
		source: 2, target: 3
	    }
	];

	this.simulator = d3.forceSimulation(this.nodes)
	    .stop()
	    .force("charge", d3.forceManyBody())
	    .force("link", d3.forceLink(this.links))
	    .force("center", d3.forceCenter());
    }
    
    ngOnInit(): void {
	console.log(this.data);
	interval(10).pipe(take(100)).subscribe(val => this.tick());
    }

    createSvg() : void {

	let transf = "translate(" + this.margin + "," + this.margin + ")";

	this.svgElement = d3.select("figure#graph")
	    .append("svg")
	    .attr("width", this.width + (this.margin * 2))
	    .attr("height", this.height + (this.margin * 2))
	    .append("g")
	    .attr("transform", transf);
    }

    draw(data : string[][]) : void {
	
    }

    sx(x : number, adj : number = 0) {
	return 200 + 3 * x + adj;
    }

    sy(y : number, adj : number = 0) {
	return 200 + 3 * y + adj;
    }

}

