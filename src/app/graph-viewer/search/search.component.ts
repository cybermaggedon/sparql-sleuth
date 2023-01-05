
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FormBuilder } from '@angular/forms';

import { Uri } from '../../rdf/triple';
import { GraphService } from '../../graph/graph.service';
import { SearchService, SearchResult } from '../../graph/search.service';
import { CommandService, Command } from '../../command.service';

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
	private command : CommandService,
	private router : Router,
    ) { }

    searchForm = this.formBuilder.group({
	search: '',
    });

    ngOnInit(): void {

	this.command.command(Command.SEARCH).subscribe(
	    ev => {
		this.executeSearch(ev.search);
	    }
	);

    }

    results : Row[] = [];

    executed : boolean = false;

    submit() : void {
	let term = this.searchForm.value.search;
	if (term)
	    this.search(term);
    }

    search(text : string) {

	this.router.navigate(
	    ["/graph"],
	    {
		queryParams: {
		    "run-search": text,
		    "announce": "no",
		}
	    }
	);
    }

    executeSearch(text : string) {

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

