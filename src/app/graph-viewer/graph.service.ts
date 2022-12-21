
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject, Subject, Observable, forkJoin, Subscriber
} from 'rxjs';

import { Triple, Value, Uri } from '../triple';
import { QueryService, Query } from '../query.service';
import { RELATION, THUMBNAIL, LABEL, IS_A } from '../rdf';

import { CommandService, Direction } from './command.service';

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

export class Properties {
    properties : { [key : string] : string } = {};
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

	this.command.showSchemaEvents().subscribe(
	    ev => {

		// Add classes
		this.query.query(
		    new Query(
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
	);

	this.command.expandEvents().subscribe(
	    ev => {

		if ((ev.dir == Direction.IN) ||
		    (ev.dir == Direction.BOTH)) {
		    this.expandIn(ev.id);
		}

		if ((ev.dir == Direction.OUT) ||
		    (ev.dir == Direction.BOTH)) {
		    this.expandOut(ev.id);
		}
	    }
	);

	this.nodeSelectEvents().subscribe(
	    (ev : any) => {
		this.getProperties(ev.node);
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
    private propertiesSubject = new Subject<Properties>;

    addNodeEvents() { return this.addNodeSubject; }
    removeNodeEvents() { return this.removeNodeSubject; }
    addEdgeEvents() { return this.addEdgeSubject; }
    removeEdgeEvents() { return this.removeEdgeSubject; }
    nodeSelectEvents() { return this.nodeSelectSubject; }
    nodeDeselectEvents() { return this.nodeDeselectSubject; }
    resetEvents() { return this.resetSubject; }
    recentreEvents() { return this.recentreSubject; }
    schemaEvents() { return this.schemaSubject; }
    propertiesEvents() { return this.propertiesSubject; }

    expandIn(id : string) {

	this.query.query(
	    new Query(
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

    expandOut(id : string) {
    
	this.query.query(
	    new Query(
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
	    new Query(
		"Label " + id,
		id,
		LABEL,
		undefined,
		this.fetchLabelEdges,
	    )
	).subscribe(
	    ev => {
		try {
		    n.label = ev[0].o.value;
		} catch {
		    n.label = this.makeLabel(id);
		}
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
	    new Query(
		"Label " + rel,
		rel,
		LABEL,
		undefined,
		this.fetchLabelEdges,
	    )
	).subscribe(
	    ev => {
		try {
		    link.label = ev[0].o.value;
		} catch {
		    link.label = this.makeLabel(rel);
		}
		this.addEdge(link);
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

    mapToClassLabel(id : string, sub : Subscriber<string[]>) {

	// IS_A relationship, work out the class name
	this.query.query(
	    new Query(
		"Label " + id,
		id, LABEL, undefined,
		this.fetchLabelEdges,
	    )
	).subscribe(
	    res => {
		
		if (res.length > 0) {
		    sub.next([
			"class", res[0].o.value
		    ]);
		    sub.complete();
		    return;
		} else {
		    sub.next(
			["class", this.makeLabel(id)]
		    );
		    sub.complete();
		    return;
		}
		
	    }

	);

    }

    mapToLiteral(p : string, o : string, sub : Subscriber<string[]>) {
	
	this.query.query(
	    new Query(
		"Label " + p,
		p, LABEL, undefined,
		this.fetchLabelEdges,
	    )
	).subscribe(
	    res => {
		
		if (res.length > 0) {
		    sub.next([
			res[0].o.value, o
		    ]);
		    sub.complete();
		    return;
		} else {
		    sub.next([
			this.makeLabel(p),
			o
		    ]);
		    sub.complete();
		    return;
		}
	    }
	    
	)
    }

    mapToProperties(res : any) {

	let todo : { [key : string] : any } = {};

	for (let row of res) {

	    todo[row.p] = new Observable<string[]>(
		sub => {
		    
		    if (row.p == LABEL) {
			
			// Label
			sub.next(["label", row.o.value]);
			sub.complete();
			return;

		    } else if (row.p == THUMBNAIL) {

			// thumbnail
			sub.next(["thumbnail", row.o.value]);
			sub.complete();
			return;

		    } else if (row.p == RELATION) {

			// link
			sub.next(["link", row.o.value]);
			sub.complete();
			return;

		    } else if (row.p == IS_A) {

			this.mapToClassLabel(row.o.value, sub);

		    } else if (row.o.uri) {

			// Property we're not interested in.
			// Indicate nothing to return.
			sub.next([]);
			sub.complete();
			return;

		    } else {

			// 'o' is a literal, just need the
			// human-readable property name.
			this.mapToLiteral(row.p, row.o.value, sub);

		    }
		}
	    );

	}

	return todo;
	
    }

    getProperties(node : Node) {

	this.query.query(
	    new Query(
		"Fetch " + node.id,
		node.id,
		undefined,
		undefined,
		this.fetchEdges,
	    )
	).subscribe(

	    res => {

		let todo = this.mapToProperties(res);

		// Empty set, return empty properties.
		// Also, forkJoin on empty set is bad.
		if (todo === {}) {
		    let ev = new Properties();
		    ev.properties = {};
		    this.propertiesSubject.next(ev);
		    return;
		}

		forkJoin(todo).subscribe(
		    (res : { [key : string] : any }) => {

			let props : { [key : string] : string } = {};

			for (let i in res) {

			    if (res[i].length == 0)
				continue;

			    props[res[i][0]] = res[i][1];

			}

			let ev = new Properties();
			ev.properties = props;
			this.propertiesSubject.next(ev);
			
		    }
		);

	    }

	)

    }
    
}

