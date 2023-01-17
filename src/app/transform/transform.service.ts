
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, forkJoin, mergeMap, of } from 'rxjs';

import { QueryResult, Row } from '../query/query';
import { QueryService } from '../query/query.service';
import { LabelQuery } from '../query/label-query';
import { RawQuery } from '../query/raw-query';
import { SPQuery } from '../query/s-p-query';
import { Uri, Value, Literal, Triple, Unbound } from '../rdf/triple';
import { LABEL, THUMBNAIL, SEE_ALSO, IS_A } from '../rdf/defs';

@Injectable({
    providedIn: 'root'
})
export class TransformService {

    constructor(
    ) {
    }

    makeLabel(uri : Uri) {
	
	let label = uri.value();

	if (label.startsWith("http://"))
            label = label.substr(label.lastIndexOf("/") + 1);

	if (label.startsWith("https://"))
            label = label.substr(label.lastIndexOf("/") + 1);

	if (label.lastIndexOf("#") >= 0)
            label = label.substr(label.lastIndexOf("#") + 1);

	if (label.length > 20)
	    label = label.substring(0, 15);

	return label;

    }

    applyToRow(
	varsFn : (vars : string[]) => string[],
	rowFn : (row : Row) => Row,
    ) {

	return mergeMap((qr : QueryResult) => {

	    if (qr.data.length == 0) {
		return of(qr);
	    }

	    let res : any[] = [];

	    for (let row of qr.data) {
		res.push(rowFn(row));
	    }

	    return forkJoin(res).pipe(
		map(
		    (rows : Row[]) => {
			return {
			    vars: varsFn(qr.vars),
			    data: rows,
			};
		    }
		)
	    );

	});

    }

    addRowProperty(row : Row, id : string, dest : string,
		   fn : (id : Uri) => Observable<Value[]>) {
	return fn(row[id]).pipe(
	    map(
		(props : Value[]) => {
		    if (props.length == 0)
			row[dest] = new Unbound();
		    else
			row[dest] = props[0];
		    return row;
		}
	    )
	);
    }

    addRowPropertyArray(row : Row, id : string, dest : string,
			fn : (id : Uri) => Observable<Value[]>) {
	return fn(row[id]).pipe(
	    map(
		(props : Value[]) => {
		    row[dest] = props;
		    return row;
		}
	    )
	);
    }

    joinProperty(id : string, dest : string,
		  fn : (id : Uri) => Observable<Value[]>) {
	return this.applyToRow(
	    vars => vars.concat(dest),
	    row => this.addRowProperty(
		row, id, dest, fn
	    )
	);
    }

    joinPropertyArray(id : string, dest : string,
		       fn : (id : Uri) => Observable<Value[]>) {
	return this.applyToRow(
	    vars => vars.concat(dest),
	    row => this.addRowPropertyArray(
		row, id, dest, fn
	    )
	);
    }

    queryResultToTriples() {

	return map(
	    (qr : QueryResult) => {

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
    
    addConstantColumn(col : string, value : Value) {

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

}

