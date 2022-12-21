
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, Subscriber, of } from 'rxjs';
import { map, retry, mergeMap, tap } from 'rxjs/operators';
import { LRUCache } from 'typescript-lru-cache';

import { Query } from './query';
import { Triple, Value, Uri } from './triple';
import { ProgressService, Activity } from '../progress.service';

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
		    q.ret.complete();
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

}

