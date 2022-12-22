
import { Component, OnInit } from '@angular/core';

import { GraphService } from '../graph.service';

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

    constructor(
	private graph : GraphService,
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
	
	this.graph.search(text).subscribe(
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

