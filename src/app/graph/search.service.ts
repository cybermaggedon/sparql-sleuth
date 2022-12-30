
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject, Subject, Observable, forkJoin, Subscriber, of,
    combineLatest
} from 'rxjs';
import { map } from 'rxjs/operators';

import { Value } from '../rdf/triple';
import { QueryService } from '../query/query.service';
import { GraphService } from './graph.service';
import { TextSearchQuery } from '../query/text-search-query';
import { TransformService } from '../query/transform.service';

export interface SearchResult {
    s : Value,
    p : Value,
    o : Value,
    slabel : Value,
    plabel : Value,
};

@Injectable({
    providedIn: 'root'
})
export class SearchService {

    constructor(
	private query : QueryService,
	private graph : GraphService,
	private transform : TransformService,
    ) {
    }

    textSearchResults = 100;

    search(text : string) : Observable<SearchResult[]> {

	return new TextSearchQuery(
	    "Search " + text,
	    text,
	    this.textSearchResults,
	).run(
	    this.query
	).pipe(
	    this.transform.queryResultToArray(),
	    map(x => x.data),
	    this.transform.mapAddLabel(0),
	    this.transform.mapAddLabel(1),
	    map(x =>
		x.map(
		    y => {
			return {
			    s: y[0],
			    p: y[1],
			    o: y[2],
			    slabel: y[3],
			    plabel: y[4],
			};
		    }
		)
	    ),
	);

    }

}

