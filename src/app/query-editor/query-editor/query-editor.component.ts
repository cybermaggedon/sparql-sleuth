import { Component, OnInit } from '@angular/core';

import { FormBuilder } from '@angular/forms';

import { RawQuery } from '../../query/raw-query';
import { QueryService } from '../../query/query.service';
import { ProgressService, ProgressEvent } from '../../progress.service';

@Component({
    selector: 'app-query-editor',
    templateUrl: './query-editor.component.html',
    styleUrls: ['./query-editor.component.scss']
})
export class QueryEditorComponent implements OnInit {

    constructor(
	private formBuilder: FormBuilder,
	private queryService : QueryService,
	private progress : ProgressService,
    ) {

	this.progress.progressEvents().subscribe(

	    (res : ProgressEvent) => {

		let a = Array.from(res.progress.values());

		if (a.length > 0)
		    this.info1 = a[0] + " ...";
		else
		    this.info1 = "";

		if (a.length > 1)
		    this.info2 = a[1] + " ...";
		else
		    this.info2 = "";

	    }

	);

    }

    rows : any[] = [];
    vars : string[] = [];

    info1 = "";
    info2 = "";

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

