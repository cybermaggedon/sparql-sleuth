
import { Injectable } from '@angular/core';

import { QueryResult } from './query';
import { Observable, forkJoin, mergeMap, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { QueryService } from './query.service';
import { LabelQuery } from './label-query';
import { Uri, Value, Literal, Triple } from './triple';

@Injectable({
    providedIn: 'root'
})
export class TransformService {

    constructor(
	private query : QueryService,
    ) {
    }

    makeLabel(uri : Uri) {
	
	let label = uri.value();

	if (label.startsWith("http://"))
            label = label.substr(label.lastIndexOf("/") + 1);

	if (label.lastIndexOf("#") >= 0)
            label = label.substr(label.lastIndexOf("#") + 1);

	if (label.length > 20)
	    label = label.substring(0, 15);

	return label;

    }

    appendLabel(x : Value[], id : number) : Observable<Value[]> {

	// This only works on URIs.  Just append the value otherwise.
	if (!x[id].is_uri())
	    return of(x.concat(x[id]));

	return new Observable<Value[]>(
	    sub => {

		if (!(x[id].is_uri()))
		    throw new Error("Can't call appendLabel on non-URI");

		new LabelQuery("Label " + x[id], x[id] as Uri).run(
		    this.query
		).subscribe(
		    (label : string | null) => {
			if (!label) label = this.makeLabel(x[id] as Uri);
			sub.next(x.concat(new Literal(label)));
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

    queryResultToTriples() {

	return map(
	    (qr : QueryResult) => {

		if (!(qr.vars == ["s", "p", "o"]))
		    throw new Error("qrToTriples requires head variables s, p, o");

		let trs : Triple[] = [];

		for(let qrow of qr.data) {
		    let t = new Triple(qrow["s"], qrow["p"], qrow["o"]);
		    trs.push(t);
		}
		
		return trs

	    }

	);

    }
    
    queryResultToStrings() {

	return map(
	    (qr : QueryResult) => {

		let trs : { [key : string] : string }[] = [];

		for(let qrow of qr.data) {

		    let row : { [key : string] : string } = {};

		    for (let v of qr.vars) {
			row[v] = qrow[v].value();
		    }

		    trs.push(row);
		}
		
		return {
		    vars: qr.vars,
		    data: trs,
		};

	    }

	);

    }
    
    queryResultToArray() {

	return map(
	    (qr : QueryResult) => {

		let trs : string[][] = [];

		for(let qrow of qr.data) {

		    let row : string[] = [];

		    for (let v of qr.vars) {
			row.push(qrow[v].value());
		    }

		    trs.push(row);
		}
		
		return {
		    vars: qr.vars,
		    data: trs,
		};

	    }

	);

    }
    
}

