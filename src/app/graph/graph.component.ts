import { Network, DataSet } from 'vis-network/standalone';

import {
    Component, OnInit, ViewChild, Input, AfterViewInit, OnChanges,
    ElementRef,
} from '@angular/core';

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
    edges : any = new DataSet([]);
    nodes : any = new DataSet([]);

    treeData : any = {
	edges: this.edges,
	nodes: this.nodes,
    }

    constructor() {
    }

    ngOnInit() {
    }
    
    ngAfterViewInit() {
	this.initVis();
    }

    ngOnChanges() {
	this.update(this.data);
    }

    initVis() {

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

}

