
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject, Subject, Observable, forkJoin, Subscriber, of,
    combineLatest
} from 'rxjs';
import { map } from 'rxjs/operators';

import { QueryService } from '../query/query.service';
import { GraphService } from './graph.service';
import { TextSearchQuery } from '../query/text-search-query';

@Injectable({
    providedIn: 'root'
})
export class SearchService {

    constructor(
	private query : QueryService,
	private graph : GraphService,
    ) {
    }

    textSearchResults = 100;

    search(text : string) : Observable<string[][]> {

	let phase1 = this.query.query(
	    new TextSearchQuery(
		"Search " + text,
		text,
		this.textSearchResults,
	    )
	);

	let phase2 = new Observable<string[][]>(

	    sub => {

		phase1.subscribe(

		    res => {

			let todo = [];

			for (let row of res) {

			    todo.push(
				this.graph.getLabel(row.s).pipe(
				    map(
					lbl => [row.s, lbl, row.p, row.o.value]
				    )
				)
			    );

			}

			// Empty set, return empty properties.
			// Also, forkJoin on empty set is bad.
			if (todo.length == 0) {
			    console.log("BAIL");
			    sub.next([]);
			    return;
			}

			forkJoin(todo).subscribe(
			    res => {
				sub.next(res);
			    }
			);

		    }

		)

	    }

	    

	);

	let phase3 = new Observable<string[][]>(

	    sub => {

		phase2.subscribe(

		    res => {

			let todo = [];

			for (let row of res) {

			    todo.push(
				this.graph.getLabel(row[2]).pipe(
				    map(
					lbl => [
					    row[0], row[1], row[2], lbl,
					    row[3]
					]
				    )
				)
			    );

			}

			// Empty set, return empty properties.
			// Also, forkJoin on empty set is bad.
			if (todo.length == 0) {
			    sub.next([]);
			    return;
			}

			forkJoin(todo).subscribe(
			    res => {
				sub.next(res);
			    }
			);

		    }

		)

	    }

	    

	);

	return phase3;

    }

}

