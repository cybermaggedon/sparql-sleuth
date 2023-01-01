
import { Component, OnInit } from '@angular/core';

import { map } from 'rxjs/operators';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A, CLASS } from '../../rdf/defs';
import { Uri } from '../../rdf/triple';
import { POQuery } from '../../query/p-o-query';
import { Row } from '../../query/query';

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

    results : Row[] = [];

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
	    this.transform.mapToEntityCount("s", "count"),
	    map((x : any) => x.data),
	).subscribe(
	    result => {
		this.results = result;
	    }
	);

    }

    select(id : Uri) {
	this.graph.includeNode(id);
    }

}

