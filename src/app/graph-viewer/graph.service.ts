
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject, Subject, Observable, forkJoin, Subscriber, of,
    combineLatest
} from 'rxjs';
import { map } from 'rxjs/operators';

import { Triple, Value, Uri } from '../query/triple';
import { QueryService } from '../query/query.service';
import { CommandService, Direction } from './command.service';

import { TripleQuery } from '../query/triple-query';
import { TextSearchQuery } from '../query/text-search-query';
import { LabelQuery } from '../query/label-query';

import { Expansion } from './expansion.service';

import { RELATION, THUMBNAIL, LABEL, IS_A } from '../rdf';

export class Node {
    id : string = "";
    label : string | null = null;
};

export class Edge {
    id : string = "";
    label : string | null = null;
    from : string = "";
    to : string = "";
};

export class AddNodeEvent {
    node : Node = new Node();
};

export class RemoveNodeEvent {
    id : string = "";
};

export class AddEdgeEvent {
    edge : Edge = new Edge();
};

export class RemoveEdgeEvent {
    id : string = "";
};

export class NodeSelectEvent {
    node : Node = new Node();
};

export class RecentreEvent {
    id : string = "";
    expand : string = "false";
};

@Injectable({
    providedIn: 'root'
})
export class GraphService {

    constructor(
	private command : CommandService,
	private query : QueryService,
    ) {

	this.recentreEvents().subscribe(

	    ev => {

		if (ev.id) {

		    this.reset();
		    this.includeNode(ev.id);

		    if (ev.expand == "in" || ev.expand == "yes" ||
			ev.expand == "both" || ev.expand == "true") {

			this.expandIn(ev.id);

		    }

		    if (ev.expand == "out" || ev.expand == "yes" ||
			ev.expand == "both" || ev.expand == "true") {

			this.expandOut(ev.id);
			
		    }

		}
	    }
	);

	this.schemaEvents().subscribe(
	    ev => {
		this.reset();
		this.addSchema();
	    }
	);

	this.command.showSchemaEvents().subscribe(
	    ev => {
		this.reset();
		this.addSchema();
	    }
	);

	this.command.expandEvents().subscribe(
	    ev => this.expand(ev.node, ev.expansion)
	);

    }

    addSchema() {

	// Add classes
	this.query.query(
	    new TripleQuery(
		"Acquire schema",
		undefined,
		"http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
		"http://www.w3.org/2000/01/rdf-schema#Class",
		50,
	    )
	).subscribe(
	    result => {
		this.includeTriples(result);
	    }
	);
    }

    fetchEdges = 25;

    // FIXME: this was previously set to 4, was there an issue?
    fetchLabelEdges = 1;

    private addNodeSubject = new Subject<AddNodeEvent>;
    private removeNodeSubject = new Subject<RemoveNodeEvent>;
    private addEdgeSubject = new Subject<AddEdgeEvent>;
    private removeEdgeSubject = new Subject<RemoveEdgeEvent>;
    private nodeSelectSubject = new Subject<NodeSelectEvent>;
    private nodeDeselectSubject = new Subject<null>;
    private resetSubject = new Subject<null>;
    private recentreSubject = new Subject<RecentreEvent>;
    private schemaSubject = new Subject<null>;

    addNodeEvents() { return this.addNodeSubject; }
    removeNodeEvents() { return this.removeNodeSubject; }
    addEdgeEvents() { return this.addEdgeSubject; }
    removeEdgeEvents() { return this.removeEdgeSubject; }
    nodeSelectEvents() { return this.nodeSelectSubject; }
    nodeDeselectEvents() { return this.nodeDeselectSubject; }
    resetEvents() { return this.resetSubject; }
    recentreEvents() { return this.recentreSubject; }
    schemaEvents() { return this.schemaSubject; }

    expandIn(id : string) {

	this.query.query(
	    new TripleQuery(
		"Expand in " + id,
		undefined,
		undefined,
		id,
		this.fetchEdges,
	    )
	).subscribe(
	    result => {
		this.includeTriples(result);
	    }
	);
	
    }

    expand(node : Node, exp : Expansion) {

	if (exp.inward) {
	    this.query.query(
		new TripleQuery(
		    "Expand in " + node.id,
		    undefined,
		    exp.id,
		    node.id,
		    this.fetchEdges,
		)
	    ).subscribe(
		result => {
		    this.includeTriples(result);
		}
	    );
	} else {
	    this.query.query(
		new TripleQuery(
		    "Expand out " + node.id,
		    node.id,
		    exp.id,
		    undefined,
		    this.fetchEdges,
		)
	    ).subscribe(
		result => {
		    this.includeTriples(result);
		}
	    );
	}

    }

    expandOut(id : string) {
    
	this.query.query(
	    new TripleQuery(
		"Expand out " + id,
		id,
		undefined,
		undefined,
		this.fetchEdges,
	    )
	).subscribe(
	    result => {
		this.includeTriples(result);
	    }
	);

    }

    addNode(node : Node) {
	let ev = new AddNodeEvent();
	ev.node = node;
	this.addNodeSubject.next(ev);
    }

    removeNode(id : string) {
	let ev = new RemoveNodeEvent();
	ev.id = id;
	this.removeNodeSubject.next(ev);
    }

    addEdge(edge : Edge) {
	let ev = new AddEdgeEvent();
	ev.edge = edge;
	this.addEdgeSubject.next(ev);
    }

    removeEdge(id : string) {
	let ev = new RemoveEdgeEvent();
	ev.id = id;
	this.removeEdgeSubject.next(ev);
    }

    select(n : Node) {
	let ev = new NodeSelectEvent();
	ev.node = n;
	this.nodeSelectSubject.next(ev);
    }

    deselect() {
	this.nodeDeselectSubject.next(null);
    }

    reset() {
	this.resetSubject.next(null);
    }

    recentre(id : string, expand : string = "no") {
	let ev = new RecentreEvent();
	ev.id = id;
	ev.expand = expand;
	this.recentreSubject.next(ev);
    }

    schema() {
	this.schemaSubject.next(null);
    }

    includeTriples(triples : Triple[]) {

	for (let triple of triples) {

	    if (triple.o.uri) {

		// Edge points to object

		// Ignore relation links, point to e.g. a web resource
		if (triple.p == RELATION) continue;

		// Ignore thumbnail links, point to a thumbnail image
		if (triple.p == THUMBNAIL) continue;

		this.includeNode(triple.s);
		this.includeNode(triple.o.value);
		this.includeEdge(triple.s, triple.p, triple.o.value);

	    } else {

		// Just a property, do nothing.

	    }
	    
	}
	
    }
    
    includeNode(id : string) {

	let n = new Node();
	n.id = id;

	this.query.query(
	    new LabelQuery("Label " + id, id,)
	).subscribe(
	    lbl => {
		if (lbl)
		    n.label = lbl;
		else
		    n.label = this.makeLabel(id);
		this.addNode(n);
	    }
	);
	
    }

    includeEdge(from : string, rel : string, to : string) {
	
	let link = new Edge();
	link.id = from + "//" + rel + "//" + to;
	link.from = from;
	link.to = to;

	this.query.query(
	    new LabelQuery("Label " + rel, rel,)
	).subscribe(
	    lbl => {
		if (lbl)
		    link.label = lbl;
		else
		    link.label = this.makeLabel(rel);
		this.addEdge(link);
	    }
	);

    }

    // Makes a label by stripping some hopefully useful text out of the ID.
    // If the ID contains a hash, you get something unfriendly.
    makeLabel(label : string) {

	if (label.startsWith("http://"))
            label = label.substr(label.lastIndexOf("/") + 1);

	if (label.lastIndexOf("#") >= 0)
            label = label.substr(label.lastIndexOf("#") + 1);

	if (label.length > 20)
	    label = label.substring(0, 15);

	return label;

    }

    getLabel(id : string) : Observable<string> {

	return this.query.query(
	    new LabelQuery("Label " + id, id,)
	).pipe(
	    map(
		res => {
		    if (res)
			return res;
		    return this.makeLabel(id);
		}
	    )
	);

    }


}

