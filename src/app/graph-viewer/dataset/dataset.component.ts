import { Component, OnInit } from '@angular/core';

import { forkJoin, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A, CLASS } from '../../rdf/defs';
import { Uri, Literal, Value } from '../../rdf/triple';
import { POQuery } from '../../query/p-o-query';
import { RawQuery } from '../../query/raw-query';
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

	const qry = 'PREFIX schema: <https://schema.org/> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?dataset ?title ?description ?url ?author (GROUP_CONCAT(?keyword,",") as ?keywords) WHERE { ?dataset a schema:Dataset . OPTIONAL { ?dataset rdfs:label ?title } OPTIONAL { ?dataset schema:description ?description } OPTIONAL { ?dataset schema:url ?url } OPTIONAL { ?dataset schema:author ?authorid . ?authorid rdfs:label ?author } OPTIONAL { ?dataset schema:keywords ?keyword } } GROUP BY ?dataset LIMIT 40';

	new RawQuery(
	    "Acquire schema", qry
	).run(
	    this.query
	).pipe(
	    map(qr => qr.data),
	).subscribe(
	    result => {
		console.log(result);
		this.results = result;
	    }
	);

    }

    select(id : Value) {
	this.graph.includeNode(id as Uri);
    }

}

