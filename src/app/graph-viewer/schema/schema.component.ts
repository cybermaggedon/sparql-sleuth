
import { Component, OnInit } from '@angular/core';

import { map } from 'rxjs/operators';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A, CLASS } from '../../rdf/defs';
import { Uri } from '../../rdf/triple';
import { POQuery } from '../../query/p-o-query';

import { QueryService } from '../../query/query.service';
import { GraphService } from '../../graph/graph.service';
import { TransformService } from '../../transform/transform.service';

@Component({
  selector: 'schema',
  templateUrl: './schema.component.html',
  styleUrls: ['./schema.component.scss']
})
export class SchemaComponent implements OnInit {

    constructor(
	private query : QueryService,
	private graph : GraphService,
	private transform : TransformService,
    ) { }

    results : any[] = [];

    ngOnInit(): void {
	this.runQuery();
    }

    runQuery() {

	new POQuery(
	    "Acquire schema", IS_A, CLASS, 50
	).run(
	    this.query
	).pipe(
	    this.transform.mapToLabel("s", "slabel"),
	    this.transform.addFixedColumn("p", IS_A),
	    this.transform.mapToLabel("p", "plabel"),
	    this.transform.addFixedColumn("o", CLASS),
	    map((x : any) => x.data),
	).subscribe(
	    result => {
		console.log(result);
		this.results = result;
//		this.includeTriples(result);
	    }
	);

    }

    select(id : Uri) {
	console.log(id);
	this.graph.includeNode(id);
    }

}

