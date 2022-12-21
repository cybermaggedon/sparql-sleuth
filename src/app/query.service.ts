
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, Subscriber, of } from 'rxjs';
import { map, retry, mergeMap, tap } from 'rxjs/operators';
import { LRUCache } from 'typescript-lru-cache';

import { Triple, Value, Uri } from './triple';
import { ProgressService, Activity } from './progress.service';

export interface Query {
    description() : string;
    getQueryString() : string;
    hash() : string;
    decode(res : any) : any 
};

export class TripleQuery implements Query {
    constructor(
	desc : string,
	s? : string,
	p? : string,
	o? : Uri | string,
	limit : number = 100
    ) {
	this.s = s;
	this.p = p;
	this.o = o;
	this.desc = desc;
	this.limit = limit;
    }
    s? : string;
    p? : string;
    o? : Uri | string;
    desc : string;
    limit : number = 100;
    description() { return this.desc; }
    hash() : string {
	return "tq " +  this.s + " " + this.p + " " + this.o + " " +
	    this.limit;
    }

    
    // FIXME: This is injectable
    // However, not using it against any sensitive data or stores, currently.
    getQueryString() : string {

	let query = "";

	query += "SELECT DISTINCT ?s ?p ?o WHERE {\n";
	query += "  ?s ?p ?o .\n";

	if (this.s) {
	    if (this.s.startsWith("http://"))
		query += "  FILTER(?s = <" + this.s + ">) .\n";
	    else
		query += "  FILTER(?s = \"" + this.s + "\") .\n";
	}

	if (this.p) {
	    if (this.p.startsWith("http://"))
		query += "  FILTER(?p = <" + this.p + ">) .\n";
	    else
		query += "  FILTER(?p = \"" + this.p + "\") .\n";
	}

	if (this.o) {
	    if (this.o.startsWith("http://"))
		query += "  FILTER(?o = <" + this.o + ">) .\n";
	    else
		query += "  FILTER(?o = \"" + this.o + "\") .\n";
	}

	query += "}\n";
	query += "LIMIT " + this.limit + "\n";

	query = encodeURIComponent(query);
	return "query=" + query + "&output=json";

    }

    decode(res : any) : any{
	
	let triples : Triple[] = [];
	
	for (let row of res.results.bindings) {

	    let s = row.s.value;

	    let p = row.p.value;

	    let o;

	    if (row.o.type == "uri")
		o = new Value(row.o.value, true);
	    else
		o = new Value(row.o.value, false);

	    let triple = new Triple(s, p, o);

	    triples.push(triple);

	}

	return triples;

    }

}

export class ExpansionsQuery implements Query {
    constructor(
	desc : string,
	id : string,
	inward : boolean,
	limit : number = 100
    ) {
	this.id = id;
	this.inward = inward;
	this.desc = desc;
	this.limit = limit;
    }
    id : string;
    inward : boolean;
    desc : string;
    limit : number = 100;
    description() { return this.desc; }
    hash() : string {
	return "eq " +  this.id + " " + this.inward + " " + this.limit;
    }

    
    // FIXME: This is injectable
    // However, not using it against any sensitive data or stores, currently.
    getQueryString() : string {

	let query = "";

	query += "SELECT DISTINCT ?p WHERE {\n";

	if (this.inward)
	    query += "  ?s ?p <" + this.id + "> . \n";
	else
	    query += "  <" + this.id + "> ?p ?o . \n";
	
	query += "}\n";
	query += "LIMIT " + this.limit + "\n";

	query = encodeURIComponent(query);

	return "query=" + query + "&output=json";

    }

    decode(res : any) : any {

	let values : Value[] = [];
	
	for (let row of res.results.bindings) {
	    let val = new Value(row.p.value, true);
	    values.push(val);
	}

	return values;

    }
	
}

class QueryRequest {
    constructor(q : Query, ret : Subscriber<any>) {
	this.q = q;
	this.ret = ret;
    }
    q : Query;
    ret : Subscriber<any>;
    hash() { return this.q.hash(); }
    description() { return this.q.description(); }
}

@Injectable({
    providedIn: 'root'
})
export class QueryService {

    constructor(
	private httpClient : HttpClient,
	private progress : ProgressService,
    ) {

	let svc = this;

	// This limits number of concurrent queries
	this.queries.pipe(
	    mergeMap(
		(qry : QueryRequest) => {
		    return this.runQuery(qry);
		},
		undefined,
		4,
	    )

	).subscribe(
	    () => {}
	);

    }

    cache = new LRUCache<string, any>(
	{
	    maxSize: 250,
	}
    );
    
    queries = new Subject<QueryRequest>;

    activeQueries = new Set<Query>;

    decodeTriples(res : any) : Triple[] {

	let triples : Triple[] = [];
	
	for (let row of res.results.bindings) {

	    let s = row.s.value;

	    let p = row.p.value;

	    let o;

	    if (row.o.type == "uri")
		o = new Value(row.o.value, true);
	    else
		o = new Value(row.o.value, false);

	    let triple = new Triple(s, p, o);

	    triples.push(triple);

	}

	return triples;
	
    }

    decodePredicates(res : any) : Value[] {

	let values : Value[] = [];
	
	for (let row of res.results.bindings) {
	    let val = new Value(row.p.value, true);
	    values.push(val);
	}

	return values;
	
    }

    executeQuery(q : Query) : Observable<Triple[]> {

	let query = q.getQueryString();

	return this.httpClient.post(
	    "/sparql",
	    query,
	    {},
	).pipe(
	    retry(3),
	    map(q.decode)
	);

    }

    runQuery(q : QueryRequest) : Observable<Triple[]> {

	this.activeQueries.add(q.q);

	this.progress.add(q.description());

	return this.executeQuery(q.q).pipe(
	    tap(
		res => {

		    let k = q.hash();

		    this.cache.set(k, res);
		    q.ret.next(res);
		    this.progress.delete(q.description());
		}
	    )
	);
    }

    query(q : Query) : Observable<Triple[]> {

	let k = q.hash();
	let cached = this.cache.get(k);

	if (cached) {
	    return of(cached);
	}

	return new Observable<Triple[]>(

	    sub => {
		let qr = new QueryRequest(q, sub);
		this.queries.next(qr);
	    }

	);

    }

    predQuery(q : Query) : Observable<Value[]> {

	let k = q.hash();
	let cached = this.cache.get(k);

	if (cached) {
	    return of(cached);
	}

	return new Observable<Value[]>(

	    sub => {
		let qr = new QueryRequest(q, sub);
		this.queries.next(qr);
	    }

	);

    }

    getExpansionsIn(id : string, limit : number = 100) : Observable<Value[]> {
	let qry = new ExpansionsQuery(
	    "Expand in " + id, id, true, limit
	);
	return this.predQuery(qry);
    }

    getExpansionsOut(id : string, limit : number = 100) : Observable<Value[]> {
	let qry = new ExpansionsQuery(
	    "Expand out " + id, id, false, limit
	);
	return this.predQuery(qry);
    }

}

