
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject, Subject, Observable, forkJoin, Subscriber, of,
    combineLatest
} from 'rxjs';
import { map } from 'rxjs/operators';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A, CLASS } from '../rdf/defs';
import { Triple, Literal, Value, Uri } from '../rdf/triple';
import { Node, Edge } from './graph';

import { QueryService } from '../query/query.service';
import { CommandService, Direction } from './command.service';
import { TransformService } from '../query/transform.service';

import { POQuery } from '../query/p-o-query';
import { OQuery } from '../query/o-query';
import { SQuery } from '../query/s-query';
import { SPQuery } from '../query/s-p-query';
import { TextSearchQuery } from '../query/text-search-query';
import { LabelQuery } from '../query/label-query';

import { Relationship } from './graph';
import { EventService } from './event.service';


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

	new POQuery(
	    "Acquire schema", IS_A, CLASS, 50
	).run(
	    this.query
	).pipe(
	    this.transform.addFixedColumn("p", IS_A),
	    this.transform.addFixedColumn("o", CLASS),
	    this.transform.queryResultToTriples(),
	).subscribe(
	    result => {
		this.includeTriples(result);
	    }
	);

    }

    fetchEdges = 40;

    relationshipIn(id : Uri) {

	new OQuery(
	    "Relationship in " + id.value(),
	    id,
	    this.fetchEdges,
	).run(
	    this.query
	).pipe(
	    this.transform.addFixedColumn("o", id),
	    this.transform.filterNonProperties(),
	    this.transform.queryResultToTriples(),
	).subscribe(
	    result => {
		this.includeTriples(result);
	    }
	);

    }

    relationshipOut(id : Uri) {

	new SQuery(
	    "Relationship out " + id.value(),
	    id,
	    this.fetchEdges,
	).run(
	    this.query
	).pipe(
	    this.transform.addFixedColumn("s", id),
	    this.transform.filterNonProperties(),
	    this.transform.queryResultToTriples(),
	).subscribe(
	    result => {
		this.includeTriples(result);
	    }
	);

    }

    relationship(node : Node, rel : Relationship) {

	if (rel.inward) {

	    let o = new Uri(node.id);
	    
	    new POQuery(
		"Relationship to " + node.id,
		rel.id,
		o,
		this.fetchEdges,
	    ).run(
		this.query
	    ).pipe(
		this.transform.addFixedColumn("p", rel.id),
		this.transform.addFixedColumn("o", o),
		this.transform.queryResultToTriples(),
	    ).subscribe(
		result => {
		    this.includeTriples(result);
		}
	    );

	} else {

	    let s = new Uri(node.id);
	    
	    new SPQuery(
		"Relationship to " + node.id,
		s,
		rel.id,
		this.fetchEdges,
	    ).run(
		this.query
	    ).pipe(
		this.transform.addFixedColumn("s", s),
		this.transform.addFixedColumn("p", rel.id),
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
//		if (triple.p == SEE_ALSO) continue;

		// Ignore thumbnail links, point to a thumbnail image
//		if (triple.p == THUMBNAIL) continue;

		this.includeNode(triple.s as Uri);
		this.includeNode(triple.o as Uri);
		this.includeEdge(
		    triple.s as Uri, triple.p as Uri, triple.o as Uri
		);

	    } else {

		// Just a property, do nothing.

	    }
	    
	}
	
    }
    
    includeNode(id : Uri) {

	let n = new Node();
	n.id = id.value();

	// FIXME: Can be wrapped in transform?
	new LabelQuery("Label " + id.value(), id).run(
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

	new LabelQuery("Label " + rel.value(), rel).run(
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

    getLabel(id : Uri) : Observable<string> {

	return new LabelQuery("Label " + id.value(), id).run(
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

