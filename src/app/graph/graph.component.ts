
import {
    Component, OnInit, Input, ViewChild, ElementRef, HostListener
} from '@angular/core';
import * as d3 from 'd3';
import { interval } from 'rxjs';
import { take } from 'rxjs';
import { Triple } from '../query.service';

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

    private width = 0;
    private height = 0;

    @ViewChild('box') private graph_container? : ElementRef;

    @Input("data") data : Triple[] = [];

    simulator : any;

    scale : number = 1;

    nodes : any[] = [];
    links : any [] = [];

    tick() : void {
	this.simulator.tick();
    }

    constructor() {
    }

    draw() {
/*
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
*/

	this.nodes = [];
	this.links = [];

	let node_map : { [ key : string ] : number } = {};
	let link_map : { [ key : string ] : number } = {};
	
	for(let d of this.data) {

	    if (!(d.s in node_map)) {
		node_map[d.s] = this.nodes.length;
		this.nodes.push({
		    x: 0, y: 0, vx: 0, vy: 0, label: d.s
		});
	    }

	    if (!(d.o.value in node_map)) {
		node_map[d.o.value] = this.nodes.length;
		this.nodes.push({
		    x: 0, y: 0, vx: 0, vy: 0, label: d.o.value
		});
	    }

	    let lid = d.s + " " + d.p + " " + d.o.value;

	    if (!(lid in link_map)) {
		link_map[lid] = this.links.length;
		this.links.push({
		    source: node_map[d.s],
		    target: node_map[d.o.value],
		});
	    }

	}

	console.log(this.nodes);

	this.simulator = d3.forceSimulation(this.nodes)
	    .stop()
	    .force("charge", d3.forceManyBody())
	    .force("link", d3.forceLink(this.links))
	    .force("center", d3.forceCenter());

	interval(10).pipe(take(200)).subscribe(val => this.tick());

    }
    
    ngOnInit(): void {
//	console.log(this.data);
	this.draw();
    }

    sx(x : number, adj : number = 0, scale : number = 1) {
	return 200 + this.scale * x + adj;
    }

    sy(y : number, adj : number = 0, scale : number = 1) {
	return 200 + this.scale * y + adj;
    }

    getContainerWidth() : number {
	if (this.graph_container)
	    return this.graph_container.nativeElement.clientWidth;
	return 0;
    }

    getContainerHeight() : number {
	if (this.graph_container)
	    return this.graph_container.nativeElement.clientHeight;
	return 0;
    }

    @HostListener('window:resize') onResize() {
	console.log(this.getContainerWidth(), this.getContainerHeight());
    }
/*
    @HostListener('wheel', ['$event']) onScroll(ev : WheelEvent) {
	var delta = Math.max(-1, Math.min(1, (ev.deltaY)));
	if(delta > 0){
	    this.scale = this.scale / 1.2;
	}else if(delta < 0){
	    this.scale = this.scale * 1.2;
	}
	}
	*/

    node_pointer_down(ev : any, node : any) {
	console.log("Pointer down", node);
    }

    node_click(ev : any, node : any) {
	console.log("Click", node);
    }

    svg_pointer_down(ev : any) {
	console.log("SVG pointer down");
    }

    svg_pointer_up(ev : any) {
	console.log("SVG pointer up");
    }

    svg_pointer_move(ev : any) {
//	console.log("SVG pointer move");
    }

    svg_wheel(ev : any) {
//	console.log("SVG wheel");
    }

    svg_click(ev : any) {
//	console.log("SVG click");
    }

}

