
import { Component, OnInit } from '@angular/core';
import { Triple } from '../triple';
import { QueryService } from '../query.service';
import { GraphService, Node, Edge } from '../graph.service';

@Component({
    selector: 'query-graph',
    templateUrl: './query-graph.component.html',
    styleUrls: ['./query-graph.component.scss']
})
export class QueryGraphComponent implements OnInit {

    constructor(
	private query : QueryService,
	private graph : GraphService,
    ) { }

    ngOnInit(): void {

	this.runQuery();
    }

    makeLabel(label : string) {

	if (label.startsWith("http://"))
            label = label.substr(label.lastIndexOf("/") + 1);

	if (label.lastIndexOf("#") >= 0)
            label = label.substr(label.lastIndexOf("#") + 1);

	if (label.length > 20)
	    label = label.substring(20);

	return label;

    }

    runQuery() {

	// http://pivotlabs.vc/challenges/c/019f2ff9af32dfac3a0dcc473cb089ebbf26ade8
	// https://pivotlabs.vc/challenges/p#has-topic

	//	let res = this.query.query("http://pivotlabs.vc/challenges/c/019f2ff9af32dfac3a0dcc473cb089ebbf26ade8", undefined, undefined);

	//	let res = this.query.query(undefined, undefined, undefined);

	this.query.query(
	    undefined, "http://pivotlabs.vc/challenges/p#has-source",
	    "http://pivotlabs.vc/challenges/s/ktn",
	    25
	).subscribe(
	    result => {

		for (let edge of result) {

		    let src = new Node();
		    src.id = edge.s;
		    src.label = this.makeLabel(edge.s);

		    this.graph.addNode(src);

		    let dest = new Node();
		    dest.id = edge.o.value;
		    dest.label = this.makeLabel(edge.o.value);

		    this.graph.addNode(dest);

		    let link = new Edge();
		    link.id = edge.s + "//" + edge.p + "//" + edge.o.value;
		    link.label = this.makeLabel(edge.p);
		    link.from = src.id;
		    link.to = dest.id;

		    this.graph.addEdge(link);
		    
		}

	    }
	);

    }

}

