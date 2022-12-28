import { Component, OnInit } from '@angular/core';

import { FormBuilder } from '@angular/forms';

import { RawQuery } from '../../query/raw-query';
import { QueryService } from '../../query/query.service';

@Component({
    selector: 'app-query-editor',
    templateUrl: './query-editor.component.html',
    styleUrls: ['./query-editor.component.scss']
})
export class QueryEditorComponent implements OnInit {

    constructor(
	private formBuilder: FormBuilder,
	private queryService : QueryService,
    ) {
    }

    rows : any[] = [];
    vars : string[] = [];

    queryForm = this.formBuilder.group({
	query: "SELECT ?s ?p ?o\nWHERE {\n  ?s ?p ?o .\n}\nLIMIT 10\n",
    });

    ngOnInit(): void {
    }

    submit() {

	if (!this.queryForm.value.query) return;

	let qry = new RawQuery("SPARQL query", this.queryForm.value.query);

	this.queryService.query(qry).subscribe(
	    ev => {
		this.vars = ev.vars;
		this.rows = ev.rows;
	    }
	);

    }

}

