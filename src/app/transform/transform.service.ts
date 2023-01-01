
import { Injectable } from '@angular/core';

import { QueryResult, Row } from '../query//query';
import { Observable, forkJoin, mergeMap, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { QueryService } from '../query/query.service';
import { LabelQuery } from '../query/label-query';
import { RawQuery } from '../query/raw-query';
import { SPQuery } from '../query/s-p-query';
import { Uri, Value, Literal, Triple } from '../rdf/triple';
import { THUMBNAIL, SEE_ALSO, IS_A } from '../rdf/defs';

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

		new LabelQuery("Label " + x[id].value(), x[id] as Uri).run(
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

    addLabel(row : Row, src : string, dest : string) : Observable<Row> {

	// This only works on URIs.  Just append the value otherwise.
	if (!row[src].is_uri()) {
	    row[dest] = row[src];
	    return of(row);
	}

	return new Observable<Row>(
	    sub => {

		if (!(row[src].is_uri()))
		    throw new Error("Can't call appendLabel on non-URI");

		new LabelQuery("Label " + row[src].value(), row[src] as Uri).run(
		    this.query
		).subscribe(
		    (label : string | null) => {
			if (!label) label = this.makeLabel(row[src] as Uri);
			row[dest] = new Literal(label);
			sub.next(row);
			sub.complete();
		    });
	    }
	);
    }

    mapToLabel(src : string, dest : string) {

        return mergeMap((qr : QueryResult) => {

            if (qr.data.length == 0) {
                return of(qr);
            }

            let res : any[] = [];

            for (let row of qr.data) {
                res.push(this.addLabel(row, src, dest));
            }

            return forkJoin(res).pipe(
                map(
                    (rows : Row[]) => {
                        return {
                            vars: qr.vars.concat(dest),
                            data: rows,
                        };
                    }
                )
            );

        });
    }

    addProperty(row : Row, id : string, pred : Uri, dest : string)
    : Observable<Row> {

	// This only works on URIs.  Just append the value otherwise.
	if (!row[id].is_uri()) {
	    row[dest] = new Literal("");
	    return of(row);
	}

	if (!pred.is_uri())
	    throw new Error("Can't call addProperty on non-URI predicate");

	return new Observable<Row>(
	    sub => {

		if (!(row[id].is_uri()))
		    throw new Error("Can't call addProperty on non-URI");

		new SPQuery(
		    "Property " + row[id].value() + " " + pred.value(),
		    row[id] as Uri,
		    pred
		).run(
		    this.query
		).subscribe(
		    (qr : QueryResult) => {
			if (qr.data.length == 0)
			    row[dest] = new Literal("");
			else
			    row[dest] = qr.data[0]["o"];
			sub.next(row);
			sub.complete();
		    });
	    }
	);
    }

    mapToProperty(id : string, pred : Uri, dest : string) {

	return mergeMap((qr : QueryResult) => {

	    if (qr.data.length == 0) {
		return of(qr);
	    }

	    let res : any[] = [];

	    for (let row of qr.data) {
		res.push(this.addProperty(row, id, pred, dest));
	    }

	    return forkJoin(res).pipe(
		map(
		    (rows : Row[]) => {
			return {
			    vars: qr.vars.concat(dest),
			    data: rows,
			};
		    }
		)
	    );
	});
    }

    queryResultToTriples() {

	return map(
	    (qr : QueryResult) => {

/*
		if ((qr.vars.length != 3) ||
		    (qr.vars[0] != "s") ||
		    (qr.vars[1] != "p") ||
		    (qr.vars[2] != "o")) {
		    throw new Error("qrToTriples requires head variables s, p, o");
		    }
		    */

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

		let trs : Value[][] = [];

		for(let qrow of qr.data) {

		    let row : Value[] = [];

		    for (let v of qr.vars) {
			row.push(qrow[v]);
		    }

		    trs.push(row);
		}
		
		return {
		    vars: qr.vars,
		    data: trs,
		};

	    }

	);

    };
    
    columnToArray(col : string) {

	return map(
	    (qr : QueryResult) => {

		let vals : Value[] = [];

		for(let qrow of qr.data) {
		    vals.push(qrow[col]);
		}
		
		return vals;

	    }

	);

    };
    
    addFixedColumn(col : string, value : Value) {

	return map(
	    (qr : QueryResult) => {

		for(let qrow of qr.data) {
		    qrow[col] = value;
		}

		qr.vars = qr.vars.concat(col);
		
		return qr;

	    }

	);

    };

    filterNonProperties() {
	return map(
	    (qr : QueryResult) => {
		qr.data = qr.data.filter(
		    row => {
			let p = row["p"];
			if (!p.is_uri()) return true;
			if (p.value() == SEE_ALSO.value()) return false;
			if (p.value() == THUMBNAIL.value()) return false;
			return true;
		    }
		);
		return qr;
	    }
	);
    };
    
    filterRelationships() {
	return map(
	    (qr : QueryResult) => {
		qr.data = qr.data.filter(
		    row => {
			let p = row["p"];
			let o = row["o"];
			if (o.is_literal()) return true;
			if (p.is_uri()) {
			    if (p.value() == SEE_ALSO.value()) return true;
			    if (p.value() == THUMBNAIL.value()) return true;
			    if (p.value() == IS_A.value()) return true;
			    return false;
			}
			// Unbound
			return false;
		    }
		);
		return qr;
	    }
	);
    };
    
    addCount(row : Row, src : string, dest : string) : Observable<Row> {

	// This only works on URIs.  Just append the value otherwise.
	if (!row[src].is_uri()) {
	    row[dest] = row[src];
	    return of(row);
	}

	return new Observable<Row>(
	    sub => {

		if (!(row[src].is_uri()))
		    throw new Error("Can't call appendLabel on non-URI");

	        let qry = "SELECT (COUNT(*) AS ?count) WHERE {  ?s a " +
		    row[src].term() + ". }";

		new RawQuery("Count " + row[src].value(), qry).run(
		    this.query
		).pipe(
		    map(res => {
			if (res.data.length > 0) {
			    let key = res.vars[0];
			    return res.data[0][key].value();
			} else {
			    return "0";
			}
		    })
		).subscribe(
		    (label : string | null) => {
			if (!label) label = this.makeLabel(row[src] as Uri);
			row[dest] = new Literal(label);
			sub.next(row);
			sub.complete();
		    }
		);

	    }
	);
    }

    mapToEntityCount(src : string, dest : string) {

        return mergeMap((qr : QueryResult) => {

            if (qr.data.length == 0) {
                return of(qr);
            }

            let res : any[] = [];

            for (let row of qr.data) {
                res.push(this.addCount(row, src, dest));
            }

            return forkJoin(res).pipe(
                map(
                    (rows : Row[]) => {
                        return {
                            vars: qr.vars.concat(dest),
                            data: rows,
                        };
                    }
                )
            );

        });
    }

}

