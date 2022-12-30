
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject, Subject, Observable, forkJoin, Subscriber, of,
    combineLatest
} from 'rxjs';
import { map } from 'rxjs/operators';

import { Node, Edge } from './graph';
import { Triple, Literal, Value, Uri } from '../query/triple';
import { QueryService } from '../query/query.service';
import { CommandService, Direction } from './command.service';
import { TransformService } from '../query/transform.service';

import { TripleQuery } from '../query/triple-query';
import { TextSearchQuery } from '../query/text-search-query';
import { LabelQuery } from '../query/label-query';

import { Relationship } from './graph';
import { EventService } from './event.service';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A } from '../rdf';

@Injectable({
    providedIn: 'root'
})
export class GraphService {

    constructor(
	private command : CommandService,
	private query : QueryService,
	private events : EventService,
	private transform : TransformService,
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
	new TripleQuery(
	    "Acquire schema",
	    undefined,
	    new Uri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
	    new Uri("http://www.w3.org/2000/01/rdf-schema#Class"),
	    50,
	).run(
	    this.query
	).pipe(
	    this.transform.queryResultToTriples(),
	).subscribe(
	    result => {
		this.includeTriples(result);
	    }
	);
    }

    fetchEdges = 40;

    relationshipIn(id : Uri) {

	new TripleQuery(
	    "Relationship in " + id,
	    undefined,
	    undefined,
	    id,
	    this.fetchEdges,
	).run(
	    this.query
	).pipe(
	    this.transform.queryResultToTriples(),
	).subscribe(
	    result => {
		this.includeTriples(result);
	    }
	);
	
    }

    relationshipOut(id : Uri) {
    
	new TripleQuery(
	    "Relationship out " + id,
	    id,
	    undefined,
	    undefined,
	    this.fetchEdges,
	).run(
	    this.query
	).pipe(
	    this.transform.queryResultToTriples(),
	).subscribe(
	    result => {
		this.includeTriples(result);
	    }
	);

    }

    relationship(node : Node, rel : Relationship) {

	if (rel.inward) {
	    new TripleQuery(
		"Relationships to " + node.id,
		undefined,
		rel.id,
		new Uri(node.id),
		this.fetchEdges,
	    ).run(
		this.query
	    ).pipe(
		this.transform.queryResultToTriples(),
	    ).subscribe(
		result => {
		    this.includeTriples(result);
		}
	    );
	} else {
	    new TripleQuery(
		"Relationships from " + node.id,
		new Uri(node.id),
		rel.id,
		undefined,
		this.fetchEdges,
	    ).run(
		this.query
	    ).pipe(
		this.transform.queryResultToTriples(),
	    ).subscribe(
		result => {
		    this.includeTriples(result);
		}
	    );
	}

    }

    includeTriples(triples : Triple[]) {

	for (let triple of triples) {

	    if (triple.o.is_uri()) {

		// Edge points to object

		// Ignore relation links, point to e.g. a web resource
		if (triple.p == SEE_ALSO) continue;

		// Ignore thumbnail links, point to a thumbnail image
		if (triple.p == THUMBNAIL) continue;

		this.includeNode(triple.s as Uri);
		this.includeNode(triple.o as Uri);
		this.includeEdge(triple.s as Uri, triple.p as Uri,
				 triple.o as Uri);

	    } else {

		// Just a property, do nothing.

	    }
	    
	}
	
    }
    
    includeNode(id : Uri) {

	let n = new Node();
	n.id = id.value();

	// FIXME: Can be wrapped in transform?
	new LabelQuery("Label " + id, id).run(
	    this.query
	).subscribe(
	    lbl => {
		if (lbl)
		    n.label = lbl;
		else
		    n.label = this.transform.makeLabel(id);
		this.events.addNode(n);
	    }
	);
	
    }

    includeEdge(from : Uri, rel : Uri, to : Uri) {
	
	let link = new Edge();
	link.id = from.value() + "//" + rel.value() + "//" + to.value();
	link.from = from.value();
	link.to = to.value();

	new LabelQuery("Label " + rel, rel,).run(
	    this.query
	).subscribe(
	    lbl => {
		if (lbl)
		    link.label = lbl;
		else
		    link.label = this.transform.makeLabel(rel);
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

    getLabel(id : Uri) : Observable<string> {

	return new LabelQuery("Label " + id, id,).run(
	    this.query
	).pipe(
	    map(
		res => {
		    if (res)
			return res;
		    return this.transform.makeLabel(id);
		}
	    )
	);

    }


}

