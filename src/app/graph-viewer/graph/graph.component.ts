
import {
    Component, OnInit, ViewChild, Input, AfterViewInit, OnChanges,
    ElementRef,
} from '@angular/core';

import { Network, DataSet } from 'vis-network/standalone';

import { Triple } from '../../rdf/triple';
import { EventService } from '../../graph/event.service';

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
	private events : EventService,
    ) {

	this.events.addNodeEvents().subscribe(
	    ev => {
		if (this.nodes.get(ev.node.id) == null) {
		    this.nodes.add({
			id: ev.node.id,
			node: ev.node,
			label: this.wrap(ev.node.label),
		    });
		}
	    }
	)

	this.events.removeNodeEvents().subscribe(
	    ev => {
		if (this.nodes.get(ev.id))
		    this.nodes.remove(ev.id);
	    }
	)

	this.events.addEdgeEvents().subscribe(
	    ev => {
		if (this.edges.get(ev.edge.id) == null) {
		    this.edges.add({
			id: ev.edge.id,
			edge: ev.edge,
			label: this.wrap(ev.edge.label),
			from: ev.edge.from,
			to: ev.edge.to,
			arrows: "to",
		    });
		}
	    }
	)

	this.events.removeEdgeEvents().subscribe(
	    ev => {
		if (this.edges.get(ev.id))
		    this.edges.remove(ev.id);
	    }
	)

	this.events.resetEvents().subscribe(
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
		    gravitationalConstant: -7000,
		}
	    }
	};

	var container = this.networkContainer?.nativeElement;
	
	this.network = new Network(container, this.treeData, options);

	let cmp = this;

	this.network.on("select", (params: any) => {
	    if (params.nodes.length == 1) {
		let id = params.nodes[0];
		let node = cmp.nodes.get(id).node;
		cmp.events.selected(node);
	    } else {
		cmp.events.deselected();
	    }
	});

	// Dragging a node appears to select it, but not trigger the
	// select event.  This causes a UI inconsistency because subsequently
	// clicking on the event doesn't cause a select event.
	this.network.on("dragStart", (params : any) => {
	/*
	    if (params.nodes.length == 1) {
	        let id = params.nodes[0];
		let node = cmp.nodes.get(id).node;
		cmp.events.selected(node);
	    }
	    */
	});

	this.network.on("dragEnd", (params : any) => {
	    this.network.unselectAll();
	});

	this.events.nodeUnselectEvents().subscribe(
	    ev => {
		this.network.unselectAll();
	    }
	);

    }

}

