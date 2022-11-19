
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

	this.graph.nodeSelectEvents().subscribe(
	    ev => {
		console.log("Selected", ev.id);
	    }
	);

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
	    undefined,
	    "http://pivotlabs.vc/challenges/p#has-source",
	    "http://pivotlabs.vc/challenges/s/ncsc",
	    25
	).subscribe(
	    result => {

		for (let edge of result) {

		    let src = new Node();
		    src.id = edge.s;
		    src.label = this.makeLabel(edge.s);

		    this.query.query(
			src.id,
			"http://www.w3.org/2000/01/rdf-schema#label",
			undefined,
			10
		    ).subscribe(
			ev => {
			    try {
				src.label = ev[0].o.value;
			    } catch {
			    }
			    this.graph.addNode(src);
			}
		    );

		    let dest = new Node();
		    dest.id = edge.o.value;
		    dest.label = this.makeLabel(edge.o.value);

		    this.query.query(
			dest.id,
			"http://www.w3.org/2000/01/rdf-schema#label",
			undefined,
			10
		    ).subscribe(
			ev => {
			    try {
				dest.label = ev[0].o.value;
			    } catch {
			    }
			    this.graph.addNode(dest);
			}
		    );

		    let link = new Edge();
		    link.id = edge.s + "//" + edge.p + "//" + edge.o.value;
		    link.label = this.makeLabel(edge.p);
		    link.from = src.id;
		    link.to = dest.id;

		    this.query.query(
			edge.p,
			"http://www.w3.org/2000/01/rdf-schema#label",
			undefined,
			10
		    ).subscribe(
			ev => {
			    try {
				link.label = ev[0].o.value;
			    } catch {
			    }
			    this.graph.addEdge(link);
			}
		    );

		    
		}

	    }
	);

    }

}

