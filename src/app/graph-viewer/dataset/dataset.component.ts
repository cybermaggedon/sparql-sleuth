import { Component, OnInit } from '@angular/core';

import { forkJoin, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A, CLASS } from '../../rdf/defs';
import { Uri, Value } from '../../rdf/triple';
import { POQuery } from '../../query/p-o-query';
import { Row } from '../../query/query';

import { QueryService } from '../../query/query.service';
import { GraphService } from '../../graph/graph.service';
import { TransformService } from '../../transform/transform.service';

@Component({
  selector: 'dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent implements OnInit {

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
	    "Acquire schema", IS_A, new Uri("http://www.w3.org/ns/dcat#Dataset"), 50
	).run(
	    this.query
	).pipe(
	    this.transform.mapToLabel("s", "slabel"),
	    this.transform.mapToProperty(
		"s", new Uri("http://purl.org/dc/terms/title"),
		"title"
	    ),
	    this.transform.mapToProperty(
		"s", new Uri("http://purl.org/dc/terms/description"),
		"description"
	    ),
	    this.transform.mapToProperty(
		"s", new Uri("http://xmlns.com/foaf/0.1/homepage"),
		"url"
	    ),
	    map(qr => qr.data),
	).subscribe(
	    result => {
		this.results = result;
	    }
	);

    }

    select(id : Value) {
	this.graph.includeNode(id as Uri);
    }

}

