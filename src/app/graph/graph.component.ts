
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

	this.network.on("selectNode", function (params : any) {
	    console.log("Node:", params.nodes[0]);
	    return true;
	});

    }
/*
    ngOnChanges() {
	this.update(this.data);
    }

    newNode(id : any, label : string) : any {

       if (label.startsWith("http://")) {
           label = label.substr(label.lastIndexOf("/") + 1);
       }

        return {
            id: id,
	    label: label,
       }
    }

    update(data : any) {

	this.edges.clear();
	this.nodes.clear();

	let node_map : { [ key : string ] : string } = {};
	let link_map : { [ key : string ] : string } = {};
       
	for(let d of data) {

            if (!(d.s in node_map)) {
		let id = "n" + this.nodes.length;
		node_map[d.s] = id;
		let node = this.newNode(id, d.s);
		this.nodes.add(node);
            }

           if (!(d.o.value in node_map)) {
	       let id = "n" + this.nodes.length;
               node_map[d.o.value] = id;
	       let node = this.newNode(id, d.o.value)
               this.nodes.add(node);
           }

           let lid = d.s + " " + d.p + " " + d.o.value;

           if (!(lid in link_map)) {
               link_map[lid] = lid;
               this.edges.add({
                   from: node_map[d.s],
                   to: node_map[d.o.value],
		   id: lid,
               });
	   }

	}

    }
*/
}

