
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

//    private width = 0;
//    private height = 0;

    @ViewChild('box') private graph_container? : ElementRef;

    @Input("data") data : Triple[] = [];

    simulator : any;

    view : {
	x : number,
	y : number,
	scale : number,
    } = {
	x: 200,
	y: 200,
	scale: 1,
    };

    nodes : any[] = [];
    links : any [] = [];

    tick() : void {
	this.simulator.tick();
    }

    constructor() {
    }

    draw() {

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
	    .force("center", d3.forceCenter(0, 0));

	interval(10).subscribe(val => this.tick());

//	this.width = this.getContainerWidth();
//	this.height = this.getContainerHeight();
//	console.log(this.width, this.height);
//	console.log(this.graph_container);

    }
    
    ngOnInit() : void {
	this.draw();
    }

    ngAfterViewInit() : void {
    }

    sx(x : number, view : any, adj : number = 0) {
	return view.x + view.scale * x + adj;
    }

    sy(y : number, view : any, adj : number = 0) {
	return view.y + view.scale * y + adj;
    }

    ax(x : number, view : any) {
	return (x - view.x) / view.scale;
    }

    ay(y : number, view : any) {
	return (y - view.y) / view.scale;
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

    selectedNode? : any = undefined;
    selectedCanvas : boolean = false;
    selectedX : number = 0;
    selectedY : number = 0;
    prevX : number = 0;
    prevY : number = 0;

    node_pointer_down(ev : any, node : any) {
	this.selectedNode = node;
	this.selectedCanvas = false;
    }

    node_click(ev : any, node : any) {
    }

    svg_pointer_down(event : PointerEvent) {
	if (this.selectedNode == undefined) {
	    this.selectedCanvas = true;
	    this.selectedX = event.offsetX;
	    this.selectedY = event.offsetY;
	    this.prevX = this.view.x;
	    this.prevY = this.view.y;
	}
	return false;
    }

    svg_pointer_up(ev : any) {
	this.selectedNode = undefined;
	this.selectedCanvas = false;
    }

    svg_pointer_move(event : PointerEvent) {
	if (this.selectedNode) {
	    this.selectedNode.x = this.ax(event.offsetX, this.view);
	    this.selectedNode.y = this.ay(event.offsetY, this.view);
	    this.simulator.restart();
	}
	if (this.selectedCanvas) {
	    this.view.x = this.prevX + (event.offsetX - this.selectedX);
	    this.view.y = this.prevY + (event.offsetY - this.selectedY);
	}
    }

    svg_wheel(event: WheelEvent) {
	var delta = Math.max(-1, Math.min(1, (event.deltaY)));
	if (delta > 0) {
	    this.view.scale = this.view.scale / 1.2;
	} else if(delta < 0) {
	    this.view.scale = this.view.scale * 1.2;
	}
    }

    svg_click(ev : any) {
    }

}

