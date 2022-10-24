
import {
    Component, OnInit, AfterViewInit, OnChanges, Input, ViewChild,
    ElementRef, HostListener
} from '@angular/core';
import * as d3 from 'd3';
import { interval, Subject } from 'rxjs';
import { take } from 'rxjs';
import { Triple } from '../query.service';

import { View } from '../view';

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, AfterViewInit, OnChanges {

    @ViewChild('box') private graph_container? : ElementRef;

    @Input("data") data : Triple[] = [];

    simulator : any;

    view : View;

    nodes : any[] = [];
    links : any [] = [];

    tick() : void {

	var x, y;

	// If a node is grabbed, remember it's position
	if (this.grabbedNode) {
	    x = this.grabbedNode.x;
	    y = this.grabbedNode.y;
	}

	this.simulator.tick();

	// If a node is grabbed, put it back where it was after simulation
	// tick
	if (this.grabbedNode) {
	    this.grabbedNode.x = x;
	    this.grabbedNode.y = y;
	}

    }

    constructor() {
	this.width_subject.subscribe(w => this.view.width = w);
	this.height_subject.subscribe(h => this.view.height = h);
	this.data_subject.subscribe(data => this.draw(data));

	this.view = new View();
	this.view.centre({x: 0, y: 0});
	this.view.setZoom(0.01);
	this.view.setSppu(10);
	this.view.setDimension(0, 0);

//	interval(1000).subscribe(t => {
	    //	    console.log(this.view.x, this.view.y, this.view.scale);
//	    console.log(this.c2sx(0, this.view), this.c2sy(0, this.view));
//	    console.log(">", this.view.width, this.view.height);
//	    console.log(">>", this.graph_container);
//	});

    }

    draw(data: Triple[]) {

	this.nodes = [];
	this.links = [];

	let node_map : { [ key : string ] : number } = {};
	let link_map : { [ key : string ] : number } = {};
	
	for(let d of data) {

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

	this.simulator = d3.forceSimulation(this.nodes)
	    .alpha(1)
	    .alphaTarget(0.02)
	    .alphaMin(0.001)
	    .stop() // Simulation uses the tick method
	    .force("charge", d3.forceManyBody().strength(-50))
	    .force("link", d3.forceLink(this.links).distance(100).strength(function(x) { return 0.1; }))
	    .force("center", d3.forceCenter(0, 0).strength(0.1));

	interval(5).subscribe(val => this.tick());

    }

    width_subject = new Subject<number>();
    height_subject = new Subject<number>();
    data_subject = new Subject<Triple[]>();

    ngOnInit() : void {

    }

    ngAfterViewInit() : void {

	// FIXME: Why this hack?
	interval(10).pipe(take(1)).subscribe(t => {
	    this.updateDimensions()
	});

    }

    ngOnChanges() : void {
	this.data_subject.next(this.data);
    }

    c2sx(x : number, view : any, adj : number = 0) {
	//	return view.x + this.view.width / 2 + view.scale * x + adj;
	return this.view.c2s({x: x + adj, y: 0}).x;
    }

    c2sy(y : number, view : any, adj : number = 0) {
//	return view.y + this.view.height / 2 + view.scale * y + adj;
	return this.view.c2s({x: 0, y: y + adj}).y;
    }

    s2cx(x : number, view : any) {
//	return (x - view.x - this.view.width / 2) / view.scale;
	return this.view.s2c({x: x, y: 0}).x;
    }

    s2cy(y : number, view : any) {
//	return (y - view.y - this.view.height / 2) / view.scale;
	return this.view.s2c({x: 0, y: y}).y;
    }

    updateDimensions() {
	if (this.graph_container) {
	    let ne = this.graph_container.nativeElement;
	    this.width_subject.next(ne.clientWidth);
	    this.height_subject.next(ne.clientHeight);
	}
    }


    @HostListener('window:resize') onResize() {
	this.updateDimensions();
    }

    grabbedNode? : any = undefined;
    selectedNode? : any = undefined;

    grabbedCanvas : boolean = false;
    grabbedX : number = 0;
    grabbedY : number = 0;
    prevX : number = 0;
    prevY : number = 0;

    node_pointer_down(ev : any, node : any) {
	this.grabbedNode = node;
	this.grabbedCanvas = false;
	ev.preventDefault();
    }

    node_pointer_up(ev : any, node : any) {
    }

    node_click(ev : any, node : any) {
    }

    svg_pointer_down(event : PointerEvent) {

//	console.log("CLEAR");
//	this.selectedNode = undefined;

	if (this.grabbedNode == undefined) {
	    this.grabbedCanvas = true;
	    this.grabbedX = event.offsetX;
	    this.grabbedY = event.offsetY;
	    this.prevX = this.view.cx;
	    this.prevY = this.view.cy;
	}
	event.preventDefault();
    }

    svg_pointer_up(ev : any) {
	this.grabbedNode = undefined;
	this.grabbedCanvas = false;
    }

    svg_click(ev : any) {
	try {
	    let ix = ev.target.attributes["data-node-index"].value;
	    this.selectedNode = this.nodes[ix];
	} catch (e : any) {
	    this.selectedNode = undefined;
	}
	ev.preventDefault();
    }

    svg_pointer_move(event : PointerEvent) {
	if (this.grabbedNode) {
	    this.grabbedNode.x = this.s2cx(event.offsetX, this.view);
	    this.grabbedNode.y = this.s2cy(event.offsetY, this.view);
	}

	if (this.grabbedCanvas) {

	    let dx = this.view.cdx(this.grabbedX - event.offsetX);
	    let dy = this.view.cdy(this.grabbedY - event.offsetY);

	    this.view.cx = this.prevX + dx;
	    this.view.cy = this.prevY + dy;

	}

    }

    svg_wheel(event: WheelEvent) {

	var delta = Math.max(-1, Math.min(1, (event.deltaY)));

        // Old position of location under mouse
	var xold = this.s2cx(event.offsetX, this.view);
	var yold = this.s2cy(event.offsetY, this.view);

	if (delta > 0) {
	    if (this.view.zoom < 0.002) return;
	    this.view.zoom /= 1.2;
	} else if(delta < 0) {
	    if (this.view.zoom > 20) return;
	    this.view.zoom *= 1.2;
	}

        // New position of location under mouse, post zoom
	var xnew = this.s2cx(event.offsetX, this.view);
	var ynew = this.s2cy(event.offsetY, this.view);

        // Move centre to keep mouse position under mouse.
	this.view.cx += xold - xnew;
	this.view.cy += yold - ynew;


    }

}

