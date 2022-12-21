
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

	query += "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
	query += "SELECT DISTINCT ?pred ?label WHERE {\n";

	if (this.inward)
	    query += "  ?s ?pred <" + this.id + "> . \n";
	else {
	    query += "  <" + this.id + "> ?pred ?o . \n";
	    
	    // Only want links to URIs, not literals.
	    // FIXME, filter out thumbnails and references?
	    query += "  FILTER(isIRI(?o)) .\n";
	}

	query += "  OPTIONAL {\n";
	query += "    ?pred rdfs:label ?label .\n";
	query += "  }\n";
	query += "}\n";
	query += "LIMIT " + this.limit + "\n";

	query = encodeURIComponent(query);

	return "query=" + query + "&output=json";

    }

    decode(res : any) : any {

	let values : Value[][] = [];

	for (let row of res.results.bindings) {
	    let pred = new Value(row.pred.value, true);
	    let label = new Value(row.label.value, true);
	    values.push([pred, label]);
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

    // Use some interface stuff to get rid of the 'any'.
    executeQuery(q : Query) : Observable<any> {

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

    // Use some interface stuff to get rid of the 'any'.
    runQuery(q : QueryRequest) : Observable<any> {

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

    // Use some interface stuff to get rid of the 'any'.
    query(q : Query) : Observable<any> {

	let k = q.hash();
	let cached = this.cache.get(k);

	if (cached) {
	    return of(cached);
	}

	return new Observable<any>(

	    sub => {
		let qr = new QueryRequest(q, sub);
		this.queries.next(qr);
	    }

	);

    }

    getExpansionsIn(id : string, limit : number = 100) :
    Observable<Value[][]> {
	let qry = new ExpansionsQuery(
	    "Expand in " + id, id, true, limit
	);
	return this.query(qry);
    }

    getExpansionsOut(id : string, limit : number = 100) :
    Observable<Value[][]> {
	let qry = new ExpansionsQuery(
	    "Expand out " + id, id, false, limit
	);
	return this.query(qry);
    }

}

