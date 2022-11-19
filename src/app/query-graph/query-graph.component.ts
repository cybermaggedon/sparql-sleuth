
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

    selected : string | undefined;
    selectedLabel : string | undefined;

    constructor(
	private query : QueryService,
	private graph : GraphService,
    ) { }

    ngOnInit(): void {

	this.runQuery();

	this.graph.nodeSelectEvents().subscribe(
	    ev => {
		this.selected = ev.id;
		this.query.query(
		    ev.id,
		    "http://www.w3.org/2000/01/rdf-schema#label",
		    undefined,
		    10
		).subscribe(
		    res => {
			try {
			    this.selectedLabel = res[0].o.value ;
			} catch {
			    this.selectedLabel = ev.id;
			}
		    }
		);
	    }
	);

	this.graph.nodeDeselectEvents().subscribe(
	    ev => {
		this.selected = undefined;
		this.selectedLabel = undefined;
	    }
	);

    }

    makeLabel(label : string) {

	if (label.startsWith("http://"))
            label = label.substr(label.lastIndexOf("/") + 1);

	if (label.lastIndexOf("#") >= 0)
            label = label.substr(label.lastIndexOf("#") + 1);

	if (label.length > 20)
	    label = label.substring(0, 30);

	return label;

    }

    addNode(id : string) {

	let n = new Node();
	n.id = id;

	this.query.query(
	    id,
	    "http://www.w3.org/2000/01/rdf-schema#label",
	    undefined,
	    4 // FIXME: only need 1
	).subscribe(
	    ev => {
		try {
		    n.label = ev[0].o.value;
		} catch {
		    n.label = this.makeLabel(id);
		}
		this.graph.addNode(n);
	    }
	);
	
    }

    addEdge(from : string, rel : string, to : string) {

	let link = new Edge();
	link.id = from + "//" + rel + "//" + to;
	link.from = from;
	link.to = to;

	this.query.query(
	    rel,
	    "http://www.w3.org/2000/01/rdf-schema#label",
	    undefined,
	    4 // FIXME: Only need 1
	).subscribe(
	    ev => {
		try {
		    link.label = ev[0].o.value;
		} catch {
		    link.label = this.makeLabel(rel);
		}
		this.graph.addEdge(link);
	    }
	);

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

		    this.addNode(edge.s);
		    this.addNode(edge.o.value);
		    this.addEdge(edge.s, edge.p, edge.o.value);
	    
		}

	    }
	);

    }

    expandIn() {

	this.query.query(
	    undefined,
	    undefined,
	    this.selected,
	    25
	).subscribe(
	    result => {

		for (let edge of result) {

		    this.addNode(edge.s);
		    this.addNode(edge.o.value);
		    this.addEdge(edge.s, edge.p, edge.o.value);
	    
		}

	    }
	);

    }

    expandOut() {

	this.query.query(
	    this.selected,
	    undefined,
	    undefined,
	    25
	).subscribe(
	    result => {

		for (let edge of result) {

		    this.addNode(edge.s);
		    this.addNode(edge.o.value);
		    this.addEdge(edge.s, edge.p, edge.o.value);
	    
		}

	    }
	);

    }

}


