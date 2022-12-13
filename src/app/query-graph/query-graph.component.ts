
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Triple } from '../triple';
import { QueryService } from '../query.service';
import { GraphService, Node, Edge } from '../graph.service';

const RELATION = "http://purl.org/dc/elements/1.1/relation";
const LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
const THUMBNAIL = "http://dbpedia.org/ontology/thumbnail";
const IS_A = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

@Component({
    selector: 'query-graph',
    templateUrl: './query-graph.component.html',
    styleUrls: ['./query-graph.component.scss']
})
export class QueryGraphComponent implements OnInit {

    selected : string | undefined;
    selectedLabel : string | undefined;
    selectedThumbnail : string | undefined;
    selectedLink : string | undefined;

    info1 : string = "";
    info2 : string = "";

    constructor(
	private query : QueryService,
	private graph : GraphService,
	private router : Router,
    ) {
    }

    properties : { [key : string] : string } = {};

    fetchEdges = 25;

    updateProperties() {

	if (this.selected == undefined) return;

	this.selectedLink = undefined;
	this.selectedLabel = undefined
	this.selectedThumbnail = undefined;

	this.query.query(
	    this.selected,
	    undefined,
	    undefined,
	    this.fetchEdges,
	).subscribe(
	    res => {

		let properties : { [key : string] : string } = {};
		let title = "n/a";

		try {

		    for (let row of res) {

			if (row.p == LABEL) {
			    this.selectedLabel = row.o.value;
			}

			if (row.p == THUMBNAIL) {
			    this.selectedThumbnail = row.o.value;
			    continue;
			}

			if (row.p == IS_A) {
			    this.query.query(
				row.o.value, LABEL, undefined,
				4 // FIXME: only need 1
			    ).subscribe(
				res => {
				    try{
					properties["class"] = res[0].o.value;
				    } catch {
				    }
				}
			    );
			}

			if (row.p == RELATION) {
			    this.selectedLink = row.o.value;
			}

			if (row.o.uri) continue;

			this.query.query(
			    row.p, LABEL, undefined,
			    4 // FIXME: only need 1
			).subscribe(
			    res => {

				let label;

				try{
				    label = res[0].o.value;
				} catch {
				    label = this.makeLabel(row.p);
				}

				properties[label] = row.o.value;
			    }
			);

		    }

		    this.properties = properties;

		} catch (e) {
		    console.log(e);
		    this.selectedLabel = "n/a";
		    this.properties = {};
		}
	    }
	);

    }

    ngOnInit(): void {

	this.runQuery();

	this.graph.nodeSelectEvents().subscribe(
	    ev => {
		if (ev.id == this.selected) return;
		this.selected = ev.id;
		this.updateProperties();

	    }
	);

	this.graph.nodeDeselectEvents().subscribe(
	    ev => {
		if (this.selected == undefined) return;
		this.selected = undefined;
		this.selectedLabel = undefined;
		this.selectedLink = undefined;
	    }
	);

	this.graph.recentreEvents().subscribe(
	    ev => {
		if (ev.id) {
		    this.recentreOn(ev.id);

		    if (ev.expand == "in" || ev.expand == "yes" ||
			ev.expand == "true") {

			this.query.query(
			    undefined,
			    undefined,
			    ev.id,
			    this.fetchEdges,
			).subscribe(
			    result => {
				this.addTriples(result);
			    }
			);

		    }

		    if (ev.expand == "out" || ev.expand == "yes" ||
			ev.expand == "true") {

			this.query.query(
			    ev.id,
			    undefined,
			    undefined,
			    this.fetchEdges,
			).subscribe(
			    result => {
				this.addTriples(result);
			    }
			);
			
		    }
		}
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

	console.log("NEW ", id);

	this.query.query(
	    id,
	    LABEL,
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
	    LABEL,
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

    addTriples(triples : Triple[]) {

	for (let triple of triples) {

	    if (triple.o.uri) {

		// Edge points to object

		// Ignore relation links, point to e.g. a web resource
		if (triple.p == RELATION) continue;

		// Ignore thumbnail links, point to a thumbnail image
		if (triple.p == THUMBNAIL) continue;

		this.addNode(triple.s);
		this.addNode(triple.o.value);
		this.addEdge(triple.s, triple.p, triple.o.value);

	    } else {

		// Just a property, do nothing.

	    }
	    
	}
	
    }

    runQuery() {

	// This was previously used to initialise the view.  Now
	// use recentre event.
	/*
	  this.query.query(
	  undefined,
	  undefined,
	  "http:... initial node id",
	  this.fetchEdges,
	  ).subscribe(
	  result => {
	  this.addTriples(result);
	  }
	  );
	*/

    }

    expandIn() {

	this.query.query(
	    undefined,
	    undefined,
	    this.selected,
	    this.fetchEdges,
	).subscribe(
	    result => {
		this.addTriples(result);
	    }
	);

    }

    expandOut() {

	this.query.query(
	    this.selected,
	    undefined,
	    undefined,
	    this.fetchEdges,
	).subscribe(
	    result => {
		this.addTriples(result);
	    }
	);

    }

    recentre() {

	this.router.navigate(
	    ["graph"],
	    { queryParams: { "node": this.selected } }
	);

    }

    recentreOn(id : string) {
	this.graph.reset();
	this.addNode(id);
	this.selectedLabel = undefined;
	this.selected = undefined;
    }

    schema() {

	this.graph.reset();

	// Add classes
	this.query.query(
	    undefined,
	    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
	    "http://www.w3.org/2000/01/rdf-schema#Class",
	    50,
	).subscribe(
	    result => {
		this.addTriples(result);
	    }
	);
// Properties don't make sense on the graph, since they don't appear as
// nodes.
/*
	// Add properties
	this.query.query(
	    undefined,
	    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
	    "http://www.w3.org/2000/01/rdf-schema#Property",
	    50,
	).subscribe(
	    result => {
		this.addTriples(result);
	    }
	);
*/
    }

}

