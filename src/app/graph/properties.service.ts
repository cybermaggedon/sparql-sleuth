
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    Subject, Observable, forkJoin, Subscriber, mergeMap, of
} from 'rxjs';
import { map } from 'rxjs/operators';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A } from '../rdf/defs';
import { Triple, Value, Uri, Literal } from '../rdf/triple';

import { QueryResult, Row } from '../query/query';
import { TransformService } from '../transform/transform.service';
import { Node } from './graph';
import { EventService } from './event.service';
import { DefinitionsService } from '../query/definitions.service';

export type PropertyMap = { [key : string] : Value };

export class Properties {
    properties : PropertyMap = {};
};

@Injectable({
    providedIn: 'root'
})
export class PropertiesService {

    constructor(
	private transform : TransformService,
	private events : EventService,
	private definitions : DefinitionsService,
    ) {

	this.events.nodeSelectedEvents().subscribe(
	    (ev : any) => {
		this.getProperties(ev.node);
	    }
	);

    }

    private propertiesSubject = new Subject<Properties>;

    propertiesEvents() { return this.propertiesSubject; }

    getProperties(node : Node) {
	return this.definitions.propertyQuery(node.id).pipe(
	    this.transform.filterRelationships(),
	    this.mapToProperties(),
	).subscribe(
	    res => {
		let prop = new Properties();
		for (let row of res) {
		    prop.properties[row["p"].value()] = row["o"];
		}
		this.propertiesSubject.next(prop);
	    }
	);
    }

    joinProperty(row : Row) {
	return new Observable<Row>(
	    sub => {
		
		let p = row["p"] as Uri;
		let o = row["o"];

		if (p.is_uri() && (p.value() == LABEL.value())) {
			
		    // Label
		    sub.next({
			p: new Literal("label"),
			o: o
		    });
		    sub.complete();

		} else if (p.is_uri() && (p.value() == THUMBNAIL.value())) {
		    
		    // thumbnail
		    sub.next({p: new Literal("thumbnail"), o: o});
		    sub.complete();

		} else if (p.is_uri() && (p.value() == SEE_ALSO.value())) {

		    // link
		    sub.next({
			p: new Literal("link"), o: o
		    });
		    sub.complete();
		    
		} else if (p.is_uri() && (p.value() == IS_A.value())) {

		    this.mapToClassLabel(o as Uri, sub);

		} else if (o.is_uri()) {

		    sub.next({});
		    sub.complete();

		} else {

		    // 'o' is a literal, just need the
		    // human-readable property name.
		    this.mapToLiteral(p, o as Uri, sub);

		}
	    }

	);
    }

    mapToProperties() {
	return mergeMap((qr : QueryResult) => {

	    if (qr.data.length == 0) {
	        return of([]);
	    }

	    let obs : any[] = [];

	    for (let row of qr.data) {
		obs.push(this.joinProperty(row));
	    }

	    return forkJoin(obs);
	    
	});
    }

    mapToLiteral(p : Uri, o : Value, sub : Subscriber<Row>) {

	this.definitions.labelQuery(p).subscribe(
	    lbl => {
		if (lbl) {
		    sub.next({p: new Literal(lbl), o: o});
		    sub.complete();
		    return;
		} else {
		    sub.next({p: new Literal(this.transform.makeLabel(p)), o: o});
		    sub.complete();
		    return;
		}
	    }
	    
	)
    }

    mapToClassLabel(id : Uri, sub : Subscriber<Row>) {

	// IS_A relationship, work out the class name

	this.definitions.labelQuery(id).subscribe(
	    lbl => {
		if (lbl) {
		    sub.next({
			p: new Literal("class"), o: new Literal(lbl)
		    });
		    sub.complete();
		    return;
		} else {
		    sub.next(
			{
			    p: new Literal("class"),
			    o: new Literal(this.transform.makeLabel(id))
			}
		    );
		    sub.complete();
		    return;
		}
		
	    }

	);

    }

    getProps(node : Node) : Observable<any> {
	return this.definitions.propertyQuery(node.id).pipe(
	    this.transform.addConstantColumn("s", new Uri(node.id)),
	    this.definitions.joinLabel("s", "slabel"),
	    this.definitions.joinLabel("p", "plabel"),
	    map(qr => {
		let res : { key : string, value : string }[] = [];

		for (let row of qr.data) {
		    res.push({
			key: row["plabel"].value(),
			value: row["o"].value()
		    });
		}
		return res;
	    }),
	);
    }

}

