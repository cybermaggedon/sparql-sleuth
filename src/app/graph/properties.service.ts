
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject, Subject, Observable, forkJoin, Subscriber, of,
    combineLatest, mergeMap
} from 'rxjs';
import { map } from 'rxjs/operators';

import { Triple, Value, Uri } from '../query/triple';
import { QueryService } from '../query/query.service';

import { TripleQuery } from '../query/triple-query';
import { RelationshipQuery } from '../query/relationship-query';
import { TextSearchQuery } from '../query/text-search-query';
import { LabelQuery } from '../query/label-query';
import { GraphService } from './graph.service';
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
		node.id,
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
			this.mapToLiteral(row.p, row.o.value, sub);

		    }
		}
	    );

	}

	return todo;
	
    }

    mapToLiteral(p : string, o : string, sub : Subscriber<string[]>) {

	this.query.query(
	    new LabelQuery("Label " + p, p)
	).subscribe(
	    lbl => {
		if (lbl) {
		    sub.next([lbl, o]);
		    sub.complete();
		    return;
		} else {
		    sub.next([this.graph.makeLabel(p), o]);
		    sub.complete();
		    return;
		}
	    }
	    
	)
    }

    mapToClassLabel(id : string, sub : Subscriber<string[]>) {

	// IS_A relationship, work out the class name


	this.query.query(
	    new LabelQuery("Label " + id, id,)
	).subscribe(
	    lbl => {
		if (lbl) {
		    sub.next([
			"class", lbl
		    ]);
		    sub.complete();
		    return;
		} else {
		    sub.next(
			["class", this.graph.makeLabel(id)]
		    );
		    sub.complete();
		    return;
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
	    label = label.substring(0, 15);

	return label;

    }

    appendLabel(x : string[], id : number) : Observable<string[]> {
	return new Observable<string[]>(
	    sub => {
		this.query.query(
		    new LabelQuery("Label " + x[id], x[id])
		).subscribe(label => {
		    if (!label) label = this.makeLabel(x[id]);
		    sub.next(x.concat(label));
		    sub.complete();
		});
	    }
	);
    }
    
    mapAddLabel(id : number) {
	return mergeMap((x : any[]) => {
	    let res : any[] = [];
	    for (let inp of x) {
		res.push(this.appendLabel(inp, id));
	    }
	    return forkJoin(res);
	});
    }

    getProps(node : Node) {
	
	return this.query.query(
	    new TripleQuery(
		"Fetch " + node.id,
		node.id,
		undefined,
		undefined,
		this.propertyEdges,
	    )
	).pipe(
	    map(
		x => x.map((y : any) => [y.p, y.o.value])
	    ),
	    this.mapAddLabel(0),
	    this.mapAddLabel(1),
	    map(
		x => {
		    let res : any = {};
		    for (let row of x) {
			res[row[2]] = row[3];
		    }
		    return res;
		}
	    )
	);
    }

}

