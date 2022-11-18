import * as vis from 'vis-network';

import {
    Component, OnInit, ViewChild, Input, AfterViewInit, OnChanges,
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

    public network: any = null;

    treeData : any = null;

    constructor() {
    }

    ngOnInit() {
    }
    
    ngAfterViewInit() {
    }

    ngOnChanges() {
	this.treeData = this.getTreeData(this.data);
	this.loadVisTree(this.treeData);
    }

    loadVisTree(treedata : any) {

	console.log(treedata);

	if (this.network) {
	    delete this.network;
	    this.network = null;
	}

	var options = {
	    interaction: {
//		hover: true,
	    }
	};

	var container = this.networkContainer?.nativeElement;

	if (!container) return;
	
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

    getTreeData(data : any) {

	var edges : any = [];
	var nodes : any = [];

	let node_map : { [ key : string ] : number } = {};
	let link_map : { [ key : string ] : number } = {};
       
	for(let d of data) {

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

	var treeData = {
	    nodes: nodes,
	    edges: edges
	};

	return treeData;

    }

}

