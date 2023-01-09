
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject, Subject, Observable, forkJoin, Subscriber, of,
    combineLatest
} from 'rxjs';
import { map } from 'rxjs/operators';

import { Literal, Value } from '../rdf/triple';
import { QueryService } from '../query/query.service';
import { GraphService } from './graph.service';
import { TextSearchQuery } from '../query/text-search-query';
import { TransformService } from '../transform/transform.service';
import { DefinitionsService } from '../query/definitions.service';
import { QueryResult } from '../query/query';

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
	private definitions : DefinitionsService,
    ) {
    }


    search(text : string) : Observable<SearchResult[]> {

	return this.definitions.textSearch(new Literal(text)).pipe(
	    map((x : QueryResult) => {
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

