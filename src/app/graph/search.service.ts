
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
import { TransformService } from '../transform/transform.service';

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
	    this.transform.mapToLabel("s", "slabel"),
	    this.transform.mapToLabel("p", "plabel"),
	    map(x => {
		if ("data" in x)
		    return x.data.map(
			row => {
			    return {
				s: row["s"],
				p: row["p"],
				o: row["o"],
				slabel: row["slabel"],
				plabel: row["plabel"],
			    };
			}
		    );
		else
		    return [];
	    }),
	);

    }

}

