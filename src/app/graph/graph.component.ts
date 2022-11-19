
import {
    Component, OnInit, ViewChild, Input, AfterViewInit, OnChanges,
    ElementRef,
} from '@angular/core';

import { Network, DataSet } from 'vis-network/standalone';

import { Triple } from '../triple';
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

    constructor(
	private graph : GraphService
    ) {

	this.graph.addNodeEvents().subscribe(
	    ev => {
		if (this.nodes.get(ev.node.id) == null) {
		    this.nodes.add({
			id: ev.node.id,
			label: ev.node.label,
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
			label: ev.edge.label,
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

    }

    ngOnInit() {
    }
    
    ngAfterViewInit() {

	var options = {
	    interaction: {
//		hover: true,
	    }
	};

	var container = this.networkContainer?.nativeElement;
	
	this.network = new Network(container, this.treeData, options);

	let cmp = this;

	this.network.on("selectNode", function (params : any) {
	    cmp.graph.select(params.nodes[0]);
	});

	this.network.on("deselectNode", function (params : any) {
	    cmp.graph.deselect();
	});

    }

}

