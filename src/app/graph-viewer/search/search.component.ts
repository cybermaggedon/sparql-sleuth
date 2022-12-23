
import { Component, OnInit } from '@angular/core';

import { GraphService } from '../../graph/graph.service';
import { SearchService } from '../../graph/search.service';

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

    constructor(
	private graph : GraphService,
	private searchService : SearchService,
    ) { }

    ngOnInit(): void {
    }

    results : string[][] = [];

    executed : boolean = false;

    search(text : string) {

	// Not doing this search, it fetches everything.
	if (text == "") {
	    this.results = [];
	    this.executed = true;
	    return;
	}
	
	this.searchService.search(text).subscribe(
	    (res : any) => {
		this.results = res;
		this.executed = true;
	    }		
	);
	
    }

    select(id : string) {
	this.graph.includeNode(id);
    }

}

