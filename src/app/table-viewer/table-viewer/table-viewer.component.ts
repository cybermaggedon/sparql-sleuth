

// localhost:8080/table?node=http:%2F%2Fpivotlabs.vc%2Finnov%2Fperson%2Fukri%2F047554e453b2e786

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormBuilder } from '@angular/forms';

//import { TripleQuery } from '../../query/triple-query';
//import { QueryService } from '../../query/query.service';
import { PropertiesService } from '../../graph/properties.service';
import { ProgressService, ProgressEvent } from '../../progress.service';
import { Node } from '../../graph/graph';

import { Observable, forkJoin, mergeMap, mergeAll, concatMap } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'table-viewer',
    templateUrl: './table-viewer.component.html',
    styleUrls: ['./table-viewer.component.scss']
})
export class TableViewerComponent implements OnInit {

    node : string = "";

    detail : {
	key : string,
	value : string
    }[] = [];

    constructor(
	private formBuilder: FormBuilder,
	private route : ActivatedRoute,
	//	private queryService : QueryService,
	private properties : PropertiesService,
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

	this.route.queryParams.subscribe(
	    params => {
		if (params["node"]) {
		    this.query(params["node"]);
		}
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

    query(id : string) {

	let n = new Node();
	n.id = id;
	
	this.properties.getProps(n).subscribe(
	    props => {
		this.detail = props;
	    }
	);

    }

    submit() {
    }

}

