
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject, Subject, Observable, forkJoin, Subscriber, of,
    combineLatest, mergeMap
} from 'rxjs';
import { map } from 'rxjs/operators';

import { Triple, Value, Uri, Literal } from '../query/triple';
import { QueryService } from '../query/query.service';

import { TripleQuery } from '../query/triple-query';
import { QueryResult } from '../query/query';
import { RelationshipQuery } from '../query/relationship-query';
import { TextSearchQuery } from '../query/text-search-query';
import { LabelQuery } from '../query/label-query';
import { GraphService } from './graph.service';
import { TransformService } from '../query/transform.service';
import { Node } from './graph';
import { EventService } from './event.service';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A } from '../rdf';

export class Properties {
    properties : { [key : string] : string } = {};
};

@Injectable({
    providedIn: 'root'
})
export class PropertiesService {

    constructor(
	private query : QueryService,
	private graph : GraphService,
	private transform : TransformService,
	private events : EventService,
    ) {

	this.events.nodeSelectEvents().subscribe(
	    (ev : any) => {
		this.getProperties(ev.node);
	    }
	);

    }

    propertyEdges = 25;

    private propertiesSubject = new Subject<Properties>;

    propertiesEvents() { return this.propertiesSubject; }

    getProperties(node : Node) {

	new TripleQuery(
	    "Fetch " + node.id,
	    new Uri(node.id),
	    undefined,
	    undefined,
	    this.propertyEdges,
	).run(this.query).subscribe(

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

			console.log(res);

			let props : { [key : string] : string } = {};

			for (let i in res) {

			    if (res[i].length == 0)
				continue;

			    props[res[i][0].value()] = res[i][1].value();

			}

			let ev = new Properties();
			ev.properties = props;
			console.log(ev);
			this.propertiesSubject.next(ev);
			
		    }
		);

	    }

	)

    }

    mapToProperties(res : QueryResult) {

	let todo : { [key : string] : any } = {};

	for (let row of res.data) {

	    let s = row["s"] as Uri;
	    let p = row["p"] as Uri;
	    let o = row["o"];

	    todo[p.value()] = new Observable<Value[]>(
		sub => {
		    
		    if (p == LABEL) {
			
			// Label
			sub.next([new Literal("label"), o]);
			sub.complete();
			return;

		    } else if (p == THUMBNAIL) {

			// thumbnail
			sub.next([new Literal("thumbnail"), o]);
			sub.complete();
			return;

		    } else if (p == SEE_ALSO) {

			// link
			sub.next([new Literal("link"), o]);
			sub.complete();
			return;

		    } else if (p == IS_A) {

			this.mapToClassLabel(o as Uri, sub);

		    } else if (o.is_uri()) {

			// Property we're not interested in.
			// Indicate nothing to return.
			sub.next([]);
			sub.complete();
			return;

		    } else {

			// 'o' is a literal, just need the
			// human-readable property name.
			this.mapToLiteral(p, o as Uri, sub);

		    }
		}
	    );

	}

	return todo;
	
    }

    mapToLiteral(p : Uri, o : Uri, sub : Subscriber<Value[]>) {

	new LabelQuery("Label " + p, p).run(
	    this.query
	).subscribe(
	    lbl => {
		if (lbl) {
		    sub.next([new Literal(lbl), o]);
		    sub.complete();
		    return;
		} else {
		    sub.next([new Literal(this.transform.makeLabel(p)), o]);
		    sub.complete();
		    return;
		}
	    }
	    
	)
    }

    mapToClassLabel(id : Uri, sub : Subscriber<Value[]>) {

	// IS_A relationship, work out the class name

	new LabelQuery("Label " + id, id,).run(
	    this.query
	).subscribe(
	    lbl => {
		if (lbl) {
		    sub.next([
			new Literal("class"), new Literal(lbl)
		    ]);
		    sub.complete();
		    return;
		} else {
		    sub.next(
			[
			    new Literal("class"),
			    new Literal(this.transform.makeLabel(id))
			]
		    );
		    sub.complete();
		    return;
		}
		
	    }

	);

    }

    getProps(node : Node) : Observable<any> {
	
	return new TripleQuery(
	    "Fetch " + node.id,
	    new Uri(node.id),
	    undefined,
	    undefined,
	    this.propertyEdges,
	).run(
	    this.query
	).pipe(
	    map(
		(x : QueryResult) => x.data.map(
		    (y : any) => [y.p, y.o]
		)
	    ),
	    this.transform.mapAddLabel(0),
	    this.transform.mapAddLabel(1),
	    map(
		(x : Value[][]) => {
		    let res : { key : string, value : string }[] = [];
		    for (let row of x) {
			res.push({key: row[2].value(), value: row[3].value()});
		    }
		    return res;
		}
	    ),
	);
    }

}

