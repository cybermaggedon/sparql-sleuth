
import { Component, OnInit } from '@angular/core';

import { GraphService } from '../../graph/graph.service';
import { SearchService } from '../../graph/search.service';

class Row {
    id : string = "";
    entity : string = "";
    property : string = "";
    value : string = "";
};

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

    results : Row[] = [];

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

		this.results = [];

		for (let row of res) {
		    let r = new Row();
		    r.id = row[0];
		    r.entity = row[1];
		    r.property = row[3];
		    r.value = row[4];
		    this.results.push(r);
		}

		this.executed = true;
	    }		
	);
	
    }

    select(id : string) {
	this.graph.includeNode(id);
    }

}

