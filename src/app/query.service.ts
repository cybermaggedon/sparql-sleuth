
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

    query(s : string | undefined, p : string | undefined,
	  o : Uri | string | undefined) : Triple[] {

	let result : Triple[] = [];

	for (let it_s in this.data) {

	    if (s != undefined && s != it_s) continue;

	    for (let it_p in this.data[it_s]) {

		if (p != undefined && p != it_p) continue;

		for (let it_o in this.data[it_s][it_p]) {

		    if (o != undefined && o != it_o) continue;

		    if (this.data[it_s][it_p][it_o].type == "literal") {
			result.push(new Triple(
			    it_s, it_p, new Value(it_p, undefined)
			));
		    } else {
			result.push(new Triple(
			    it_s, it_p, new Value(undefined, it_p)
			));
		    }

		}

	    }

	}

	return result;

    }

}

