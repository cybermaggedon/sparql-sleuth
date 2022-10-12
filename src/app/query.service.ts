
import { Injectable } from '@angular/core';
import { DataTriples, data } from './data';

type Uri = string;

class Value {
    constructor(uri : string | undefined, literal : string | undefined) {
	this.uri = uri;
	this.literal = literal;
    }
    is_uri() : boolean { return this.uri != undefined; }
    is_literal() : boolean { return this.uri != undefined; }
    value() : string {
	if (this.uri != undefined) return this.uri;
	if (this.literal != undefined) return this.literal;
	return "FIXME: Should not happen";
    }
    uri? : string = "";
    literal? : string = "";
};

class Triple {
    constructor(s : Uri, p : Uri, o : Value) {
	this.s = s; this.p = p; this.o = o;
    }
    s : Uri = "";
    p : Uri = "";
    o : Value = new Value(undefined, "");
};

@Injectable({
    providedIn: 'root'
})
export class QueryService {

    data : DataTriples;

    constructor() {
	this.data = data;
    }

    query(
	s : string | undefined, p : string | undefined,
	o : Uri | string | undefined,
	limit : number = 100
    ) : Triple[] {

        let result : Triple[] = [];

	let count = 0;

	for (let it_s in this.data) {

	    let dim_s = this.data[it_s];

	    if (s != undefined && s != it_s) continue;

	    for (let it_p in dim_s) {

		let dim_p = dim_s[it_p];

		if (p != undefined && p != it_p) continue;

		for (let it_o in dim_p) {

		    let dim_o = dim_p[it_o];

		    if (o != undefined && o != dim_o.value) continue;

		    if (dim_o.type == "literal") {
			result.push(new Triple(
			    it_s, it_p, new Value(dim_o.value, undefined)
			));
		    } else {
			result.push(new Triple(
			    it_s, it_p, new Value(undefined, dim_o.value)
			));
		    }

		    count += 1;

		    if (count >= limit) return result;

		}

	    }

	}

	return result;

    }

}

