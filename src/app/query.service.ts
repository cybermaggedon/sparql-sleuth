
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, Subscriber, of } from 'rxjs';
import { map, retry, mergeMap, tap } from 'rxjs/operators';
import { LRUCache } from 'typescript-lru-cache';

import { Triple, Value, Uri } from './triple';
import { ProgressService, Activity } from './progress.service';

export class Query {
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
}

class QueryRequest {
    constructor(q : Query, ret : Subscriber<any>) {
	this.q = q;
	this.ret = ret;
    }
    q : Query;
    ret : Subscriber<any>;
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
		    return this.directQuery(qry);
		},
		undefined,
		4,
	    )

	).subscribe(
	    () => {}
	);

    }

    cache = new LRUCache<string, Triple[]>(
	{
	    maxSize: 250,
	}
    );
    
    queries = new Subject<QueryRequest>;

    activeQueries = new Set<Query>;

    getQueryString(q : Query) : string {

	let query = "";

	query += "SELECT DISTINCT ?s ?p ?o WHERE {\n";
	query += "  ?s ?p ?o .\n";

	if (q.s) {
	    if (q.s.startsWith("http://"))
		query += "  FILTER(?s = <" + q.s + ">) .\n";
	    else
		query += "  FILTER(?s = \"" + q.s + "\") .\n";
	}

	if (q.p) {
	    if (q.p.startsWith("http://"))
		query += "  FILTER(?p = <" + q.p + ">) .\n";
	    else
		query += "  FILTER(?p = \"" + q.p + "\") .\n";
	}

	if (q.o) {
	    if (q.o.startsWith("http://"))
		query += "  FILTER(?o = <" + q.o + ">) .\n";
	    else
		query += "  FILTER(?o = \"" + q.o + "\") .\n";
	}

	query += "}\n";
	query += "LIMIT " + q.limit + "\n";

	query = encodeURIComponent(query);
	return "query=" + query + "&output=json";

    }

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

    executeQuery(q : Query) : Observable<Triple[]> {

	let query = this.getQueryString(q);

	return this.httpClient.post(
	    "/sparql",
	    query,
	    {},
	).pipe(
	    retry(3),
	    map(this.decodeTriples)
	);

    }

    directQuery(q : QueryRequest) : Observable<Triple[]> {

	this.activeQueries.add(q.q);

	this.progress.add(q.q.desc);

	return this.executeQuery(q.q).pipe(
	    tap(
		res => {
		    let k = q.q.s + " " + q.q.p + " " + q.q.o + " " + q.q.limit;

		    this.cache.set(k, res);
		    q.ret.next(res);
		    this.progress.delete(q.q.desc);
		}
	    )
	);
    }

    query(q : Query) : Observable<Triple[]> {

	let k = q.s + " " + q.p + " " + q.o + " " + q.limit;
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

}

