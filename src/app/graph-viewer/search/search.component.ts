
import { Component, OnInit } from '@angular/core';

import { FormBuilder } from '@angular/forms';

import { Uri } from '../../rdf/triple';
import { GraphService } from '../../graph/graph.service';
import { SearchService, SearchResult } from '../../graph/search.service';

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
	private formBuilder: FormBuilder,
    ) { }

    searchForm = this.formBuilder.group({
	search: '',
    });

    ngOnInit(): void {
    }

    results : Row[] = [];

    executed : boolean = false;

    submit() : void {
	let term = this.searchForm.value.search;
	if (term)
	    this.search(term);
    }

    search(text : string) {

	// Not doing this search, it fetches everything.
	if (text == "") {
	    this.results = [];
	    this.executed = true;
	    return;
	}
	
	this.searchService.search(text).subscribe(
	    (res : any) => {

console.log(res);

		this.results = [];

		for (let row of res) {
		    let r = new Row();
		    r.id = row.s.value();
		    r.entity = row.slabel.value();
		    r.property = row.plabel.value();
		    r.value = row.o.value();
		    this.results.push(r);
		}

		this.executed = true;
	    }		
	);
	
    }

    select(id : string) {
	this.graph.includeNode(new Uri(id));
    }

}

