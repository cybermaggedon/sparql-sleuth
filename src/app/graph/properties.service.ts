
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    Subject, Observable, forkJoin, Subscriber, mergeMap, of, timer
} from 'rxjs';
import { map } from 'rxjs/operators';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A } from '../rdf/defs';
import { Triple, Value, Uri, Literal } from '../rdf/triple';

import { QueryResult, Row } from '../query/query';
import { TransformService } from '../transform/transform.service';
import { Node } from './graph';
import { EventService } from './event.service';
import { DefinitionsService } from '../query/definitions.service';

export interface Property {
    key : string;
    value : Value;
};

export class Properties {

    private props : Property[] = [];

    empty() { return this.props.length == 0; }

    private propMap : { [key : string] : string } = {};

    set properties(p : Property[]) {
	this.props = p;
	this.propMap = {};

	for(let prop of p) {
	    this.propMap[prop.key] = prop.value.value();
	}

    }

    get(k : string) {
	if (k in this.propMap) return this.propMap[k];
	return "";
    }

    get properties() : Property[] {
	return this.props;
    }

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

    }

    private mapProperties() {
	return mergeMap(
	    (res : Row[]) => {
		let tasks = res.map(
		    (row : Row) : Observable<Property> => {

			let p = row["p"] as Uri;
			let o = row["o"];

			// Label
			if (p.is_uri() && (p.value() == LABEL.value())) {
			    return of({
				key: "label",
				value: o
			    });

			    // Thumbnail
			} else if (p.is_uri() &&
				   (p.value() == THUMBNAIL.value())) {
			    return of({
				key: "thumbnail",
				value: o
			    });

			    // See also
			} else if (p.is_uri() &&
				   (p.value() == SEE_ALSO.value())) {
			    return of({
				key: "link",
				value: o
			    });

			    // RDF type
			} else if (p.is_uri() &&
				   (p.value() == IS_A.value())) {
			    return this.definitions.labelQuery(o).pipe(
				map(
				    (lbl : string) : Property => {
					return {
					    key: "class",
					    value: new Literal(lbl),
					};
				    }
				    
				)
			    );

			    // Literal
			} else {
			    return this.definitions.labelQuery(p).pipe(
				map(
				    (lbl : string) : Property => {
					return {
					    key: lbl,
					    value: o
					};
				    }
				    
				)
			    );
			} 

		    });
		if (tasks.length == 0) return of([]);
		return forkJoin(tasks);
	    }
	);

    }

    getProperties(node : Node) : Observable<Properties> {
	
	return this.definitions.propertyQuery(new Uri(node.id)).pipe(
	    this.transform.filterRelationships(),
	    map(res => res.data),
	    this.mapProperties(),
	    map(
		res => {
		    let props = new Properties();
		    props.properties = res;
		    return props;
		}
	    )
	);

    }


    getProps(node : Node) : Observable<any> {
	return this.definitions.propertyQuery(new Uri(node.id)).pipe(
	    this.transform.addConstantColumn("s", new Uri(node.id)),
	    this.definitions.joinLabel("s", "slabel"),
	    this.definitions.joinLabel("p", "plabel"),
	    map((qr : QueryResult) : { key : string, value : string }[] => {
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

