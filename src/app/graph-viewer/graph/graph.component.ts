
import {
    Component, OnInit, ViewChild, Input, AfterViewInit, OnChanges,
    ElementRef,
} from '@angular/core';

import { Network, DataSet } from 'vis-network/standalone';

import { Triple } from '../../triple';
import { GraphService } from '../graph.service';

@Component({
    selector: 'graph',
    templateUrl: './graph.component.html',
    styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

    @ViewChild("network") networkContainer: ElementRef | undefined;

    public network: any = null;
    edges : any = new DataSet([]);
    nodes : any = new DataSet([]);

    treeData : any = {
	edges: this.edges,
	nodes: this.nodes,
    }

    wrap(s : string | null) : string {
	if (s == null) return "";
	return s.replace(
	    /(?![^\n]{1,32}$)([^\n]{1,32})\s/g, '$1\n'
	);
    }

    constructor(
	private graph : GraphService
    ) {

	this.graph.addNodeEvents().subscribe(
	    ev => {
		if (this.nodes.get(ev.node.id) == null) {
		    this.nodes.add({
			id: ev.node.id,
			label: this.wrap(ev.node.label),
		    });
		}
	    }
	)

	this.graph.removeNodeEvents().subscribe(
	    ev => {
		if (this.nodes.get(ev.id))
		    this.nodes.remove(ev.id);
	    }
	)

	this.graph.addEdgeEvents().subscribe(
	    ev => {
		if (this.edges.get(ev.edge.id) == null) {
		    this.edges.add({
			id: ev.edge.id,
			label: this.wrap(ev.edge.label),
			from: ev.edge.from,
			to: ev.edge.to,
			arrows: "to",
		    });
		}
	    }
	)

	this.graph.removeEdgeEvents().subscribe(
	    ev => {
		if (this.edges.get(ev.id))
		    this.edges.remove(ev.id);
	    }
	)

	this.graph.resetEvents().subscribe(
	    ev => {

		this.nodes.clear();
		this.edges.clear();
		
	    }
	)

    }

    ngOnInit() {
    }
    
    ngAfterViewInit() {

	var options = {
	    interaction: {
	    },
	    physics: {
		barnesHut: {
		    gravitationalConstant: -3000,
		}
	    }
	};

	var container = this.networkContainer?.nativeElement;
	
	this.network = new Network(container, this.treeData, options);

	let cmp = this;

	this.network.on("selectNode", function (params : any) {
	    cmp.graph.select(params.nodes[0]);
	});

	// Bug in visjs?  Dragging selects a node but doesn't cause a
	// select event.
	this.network.on("dragStart", function (params : any) {
	    if (params.nodes.length == 1) {
		cmp.graph.select(params.nodes[0]);
	    }
	});

    }

}

