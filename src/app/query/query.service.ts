
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, Subscriber, of } from 'rxjs';
import { map, retry, mergeMap, tap } from 'rxjs/operators';
import { LRUCache } from 'typescript-lru-cache';

import { Query, QueryResult, QueryEngine } from './query';
import { Triple, Value, Literal, Uri, Unbound } from '../rdf/triple';
import { ProgressService, Activity } from '../progress.service';
import { ConfigService } from '../config.service';

class QueryRequest {
    constructor(q : Query, ret : Subscriber<any>) {
	this.q = q;
	this.ret = ret;
    }
    q : Query;
    ret : Subscriber<any>;
    hash() { return this.q.hash(); }
    description() { return this.q.description(); }
};

interface SparqlResult {
    head : {
	vars : string[]
    },
    results : {
	ordered : boolean,
	distinct : boolean,
	bindings : {
	    [key : string] : {
		type : string,
		value? : string,
		datatype? : string,
	    }
	}[]
    }    
};

const maxConcurrent = 2;

@Injectable({
    providedIn: 'root'
})
export class QueryService implements QueryEngine {

    constructor(
	private httpClient : HttpClient,
	private progress : ProgressService,
	private config : ConfigService,
    ) {

	let svc = this;

	// This limits number of concurrent queries
	this.queries.pipe(
	    mergeMap(
		(qry : QueryRequest) => {
		    return this.runQuery(qry);
		},
		undefined,
		maxConcurrent,
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

    transform(sr : SparqlResult) : QueryResult {
	let qr = new QueryResult();

	qr.vars = sr.head.vars;

	for (let row of sr.results.bindings) {

	    let qrow : { [key : string] : Value } = {};

	    for (let k in row) {

		let dat = row[k];

		if (dat.type == "unbound") {
		    qrow[k] = new Unbound();
		} else if (dat.type == "bnode") {
		    // Dunno what we're supposed to do with bnode?
		    qrow[k] = new Unbound();
		} else if (dat.type == "literal") {
		    if (dat.value === undefined)
			throw new Error("SPARQL results missing a literal value");
		    qrow[k] = new Literal(dat.value, dat.datatype);
		} else if (dat.type == "uri") {
		    if (dat.value === undefined)
			throw new Error("SPARQL results missing a URI value");
		    qrow[k] = new Uri(dat.value);
		} else {
		    throw new Error("Unexpected data value in SPARQL decode");
		}

	    }

	    qr.data.push(qrow);

	}

	return qr;

    };

    // Use some interface stuff to get rid of the 'any'.
    executeQuery(q : Query) : Observable<QueryResult> {

	let query = q.getQueryString();

	return this.config.getSparqlUrl().pipe(
	    mergeMap(
		sparqlUrl => {

		    let headers = new HttpHeaders({
			"Content-Type": "application/x-www-form-urlencoded",
			"Accept": "application/sparql-results+json",
		    });

		    return this.httpClient.post<SparqlResult>(
			sparqlUrl,
			query,
			{
			    headers: headers,
			},
		    )

		}
	    ),
	    retry(3),
	    map(res => this.transform(res)),
	);

    }

    // Use some interface stuff to get rid of the 'any'.
    runQuery(q : QueryRequest) : Observable<QueryResult> {

	this.activeQueries.add(q.q);

	this.progress.add(q.description());

	return this.executeQuery(q.q).pipe(
	    tap(
		res => {

		    let k = q.hash();

		    this.cache.set(k, res);
		    q.ret.next(res);
		    q.ret.complete();
		    this.progress.delete(q.description());
		}
	    )
	);
    }

    // Use some interface stuff to get rid of the 'any'.
    query(q : Query) : Observable<QueryResult> {

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

}

