
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

	this.query.query(
	    new TripleQuery(
		"Fetch " + node.id,
		new Uri(node.id),
		undefined,
		undefined,
		this.propertyEdges,
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

    mapToProperties(res : any) {

	let todo : { [key : string] : any } = {};

	for (let row of res) {

	    todo[row.p] = new Observable<Value[]>(
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

		    } else if (row.p == SEE_ALSO) {

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
			this.mapToLiteral(row.p, row.o, sub);

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
	    map(
		x => {
		    console.log(x);
		    return x;
		}
	    ),
	);
    }

}

