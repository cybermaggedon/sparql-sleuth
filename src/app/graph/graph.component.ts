
import {
    Component, OnInit, Input, ViewChild, ElementRef, HostListener
} from '@angular/core';
import * as d3 from 'd3';
import { interval } from 'rxjs';
import { take } from 'rxjs';

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

    private width = 0;
    private height = 0;

    @ViewChild('box') private graph_container? : ElementRef;

    @Input("data") data : string[][] = [];

    simulator : any;

    scale : number = 1;

    nodes : any[] = [];
    links : any [] = [];

    tick() : void {
	this.simulator.tick();
    }

    constructor() {

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

    @HostListener('wheel', ['$event']) onScroll(ev : WheelEvent) {
	var delta = Math.max(-1, Math.min(1, (ev.deltaY)));
	if(delta > 0){
	    console.log("zoom out");
	    this.scale = this.scale / 1.2;
	}else if(delta < 0){
	    console.log("zoom in");
	    this.scale = this.scale * 1.2;
	}
	console.log(this.scale);
    }

}

