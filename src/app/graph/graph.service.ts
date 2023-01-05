
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
import { CommandService, Direction, Command } from '../command.service';
import { TransformService } from '../transform/transform.service';

import { POQuery } from '../query/p-o-query';
import { OQuery } from '../query/o-query';
import { SQuery } from '../query/s-query';
import { SPQuery } from '../query/s-p-query';
import { LabelQuery } from '../query/label-query';

import { Relationship } from './graph';
import { EventService } from './event.service';
import { DefinitionsService } from '../query/definitions.service';

@Injectable({
    providedIn: 'root'
})
export class GraphService {

    constructor(
	private command : CommandService,
	private query : QueryService,
	private events : EventService,
	private transform : TransformService,
	private definitions: DefinitionsService,
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
	    // This is a legacy event
	    }
	);

	this.command.command(Command.RELATIONSHIP).subscribe(
	    ev => this.relationship(
		ev.relationship.node,
		ev.relationship.relationship
	    )
	);

    }


    relationshipIn(id : Uri) {

	return this.definitions.relationshipsIn(id).pipe(
	    this.transform.addConstantColumn("o", id),
	    this.transform.filterNonProperties(),
	    this.transform.queryResultToTriples(),
	).subscribe(
	    result => {
		this.includeTriples(result);
	    }
	);

    }

    relationshipOut(id : Uri) {

	this.definitions.relationshipsOut(id).pipe(
	    this.transform.addConstantColumn("s", id),
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

	    this.definitions.relationshipsInward(node.id, rel.id).pipe(
		this.transform.addConstantColumn("p", rel.id),
		this.transform.addConstantColumn("o", o),
		this.transform.queryResultToTriples(),
	    ).subscribe(
		result => {
		    this.includeTriples(result);
		}
	    );

	} else {

	    let s = new Uri(node.id);
	    
	    this.definitions.relationshipsOutwards(node.id, rel.id).pipe(
		this.transform.addConstantColumn("s", s),
		this.transform.addConstantColumn("p", rel.id),
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
	this.definitions.labelQuery(id).subscribe(
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

	this.definitions.labelQuery(rel).subscribe(
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

	return this.definitions.labelQuery(id).pipe(
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

