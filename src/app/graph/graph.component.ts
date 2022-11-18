import * as vis from 'vis-network';

import {
    Component, OnInit, ViewChild, Input, AfterViewInit
} from '@angular/core';
import { ElementRef, Renderer2 } from '@angular/core';
import { Triple } from '../query.service';

@Component({
    selector: 'graph',
    templateUrl: './graph.component.html',
    styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

    @ViewChild("siteConfigNetwork") networkContainer: ElementRef | undefined;

    @Input("data") data : Triple[] = [];

    public network: any;

    treeData : any;

    constructor() {
    }

    ngOnInit() {
	this.treeData = this.getTreeData();
    }

    
    ngAfterViewInit() {
//	console.log(this.data);
	// RENDER STANDARD NODES WITH TEXT LABEL
	this.loadVisTree(this.treeData);
	console.log(this.treeData);
    }

    loadVisTree(treedata : any) {

	var options = {
	    interaction: {
//		hover: true,
	    }
	};

	var container = this.networkContainer?.nativeElement;
	this.network = new vis.Network(container, treedata, options);

	this.network.on("selectNode", function (params : any) {
	    console.log("Node:", params.nodes[0]);
	    return true;
	});

	var that = this;
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

    getTreeData() {
	/*
	var nodes =[
            {id: 1, label: 'Node 1', title: 'I am node 1!'},
            {id: 2, label: 'Node 2', title: 'I am node 2!'},
            {id: 3, label: 'Node 3'},
            {id: 4, label: 'Node 4'},
            {id: 5, label: 'Node 5'}
	];

	// create an array with edges
	var edges = [
            {from: 1, to: 3, id: 'a'},
            {from: 1, to: 2, id: 'b'},
            {from: 2, to: 4, id: 'c'},
            {from: 2, to: 5, id: 'd'}
	    ];
	*/

	var edges : any = [];
	var nodes : any = [];

	let node_map : { [ key : string ] : number } = {};
	let link_map : { [ key : string ] : number } = {};
       
	for(let d of this.data) {

            if (!(d.s in node_map)) {
		node_map[d.s] = nodes.length;
		let node = this.newNode(nodes.length, d.s);
		nodes.push(node);
            }

           if (!(d.o.value in node_map)) {
               node_map[d.o.value] = nodes.length;
	       let node = this.newNode(nodes.length, d.o.value)
               nodes.push(node);
           }

           let lid = d.s + " " + d.p + " " + d.o.value;

           if (!(lid in link_map)) {
               link_map[lid] = edges.length;
               edges.push({
                   from: node_map[d.s],
                   to: node_map[d.o.value],
		   id: lid,
               });
	   }

	}

	console.log(nodes);
	console.log(edges);

	var treeData = {
	    nodes: nodes,
	    edges: edges
	};

	return treeData;

    }

}

