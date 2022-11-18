import { Network, DataSet } from 'vis-network/standalone';

import {
    Component, OnInit, ViewChild, Input, AfterViewInit, OnChanges,
    ElementRef,
} from '@angular/core';

import { Triple } from '../query.service';

import { interval, timer } from 'rxjs';
import { take, delay } from 'rxjs/operators';

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
	interval(2000).pipe(
	    take(1)
	).subscribe(() => {

	    this.tweakIt();

	});

    }

    ngOnInit() {
    }
    
    ngAfterViewInit() {
    }

    tweakIt() {

	    console.log("UPDATE");

	    this.treeData.nodes.add({
		id: "x1", label: "x1",
	    });

	    if (this.network) {
		console.log("NETWORK IS SET");
		//this.network.redraw();
//		this.network.setData(this.treeData);
	    }

    }

    ngOnChanges() {
	console.log("CHANGES");

	// this.treeData = this.getTreeData(this.data);
	//	this.loadVisTree(this.treeData);

	this.treeData = {
	    nodes: new DataSet([
		{ id: "n1", label: "bunch1" },
		{ id: "n2", label: "bunch2" },
		{ id: "n3", label: "bunch3" },
	    ]),
	    edges: new DataSet([
		{ from: "n1", to: "n3", id: "1-3", label: "cliche" },
		{ from: "n1", to: "n2", id: "1-2", arrows: "to"},
		{ from: "n2", to: "n3", id: "2-3" },
	    ])
	};

	this.loadVisTree(this.treeData);

    }

    loadVisTree(treedata : any) {

	console.log("load:", treedata);

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
	
	this.network = new Network(container, treedata, options);

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
		nodes.add(node);
            }

           if (!(d.o.value in node_map)) {
               node_map[d.o.value] = nodes.length;
	       let node = this.newNode(nodes.length, d.o.value)
               nodes.add(node);
           }

           let lid = d.s + " " + d.p + " " + d.o.value;

           if (!(lid in link_map)) {
               link_map[lid] = edges.length;
               edges.add({
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

