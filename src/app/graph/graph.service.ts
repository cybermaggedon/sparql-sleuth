
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject, Subject, Observable, forkJoin, Subscriber, of,
    combineLatest
} from 'rxjs';
import { map } from 'rxjs/operators';

import { Node, Edge } from './graph';
import { Triple, Value, Uri } from '../query/triple';
import { QueryService } from '../query/query.service';
import { CommandService, Direction } from './command.service';

import { TripleQuery } from '../query/triple-query';
import { TextSearchQuery } from '../query/text-search-query';
import { LabelQuery } from '../query/label-query';

import { Relationship } from './graph';
import { EventService } from './event.service';

import { RELATION, THUMBNAIL, LABEL, IS_A } from '../rdf';

@Injectable({
    providedIn: 'root'
})
export class GraphService {

    constructor(
	private command : CommandService,
	private query : QueryService,
	private events : EventService,
    ) {

	this.events.recentreEvents().subscribe(

	    ev => {

		if (ev.id) {

		    this.events.reset();
		    this.includeNode(ev.id);

		    if (ev.relationship == "in" || ev.relationship == "yes" ||
			ev.relationship == "both" || ev.relationship == "true") {

			this.relationshipIn(ev.id);

		    }

		    if (ev.relationship == "out" || ev.relationship == "yes" ||
			ev.relationship == "both" || ev.relationship == "true") {

			this.relationshipOut(ev.id);
			
		    }

		}
	    }
	);

	// If there's a schema event, reset the graph and drop the schema in
	// place.
	this.events.schemaEvents().subscribe(
	    ev => {
		this.events.reset();
		this.addSchema();
	    }
	);

	// This is weird. The schema event can occur in two observable systems,
	// the command one, and the event one.  This bridges the event off of
	// the command system to the event system.
	this.command.showSchemaEvents().subscribe(
	    ev => {
		this.events.reset();
		this.events.schema();
	    }
	);

	this.command.relationshipEvents().subscribe(
	    ev => this.relationship(ev.node, ev.relationship)
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

    fetchEdges = 40;

    relationshipIn(id : string) {

	this.query.query(
	    new TripleQuery(
		"Relationship in " + id,
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

    relationshipOut(id : string) {
    
	this.query.query(
	    new TripleQuery(
		"Relationship out " + id,
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

    relationship(node : Node, rel : Relationship) {

	if (rel.inward) {
	    this.query.query(
		new TripleQuery(
		    "Relationships to " + node.id,
		    undefined,
		    rel.id,
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
		    "Relationships from " + node.id,
		    node.id,
		    rel.id,
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
		this.events.addNode(n);
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
		this.events.addEdge(link);
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

