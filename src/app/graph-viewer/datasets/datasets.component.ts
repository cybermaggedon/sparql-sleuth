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
import { DefinitionsService } from '../../query/definitions.service';
import { CommandService, Command } from '../../command.service';

@Component({
  selector: 'datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss']
})
export class DatasetsComponent implements OnInit {

    constructor(
	private query : QueryService,
	private graph : GraphService,
	private transform : TransformService,
	private command : CommandService,
	private definitions : DefinitionsService,
    ) { }

    datasets : Row[] = [];

    ngOnInit(): void {

	this.command.command(Command.DATASETS).subscribe(
	    () => {

		if (this.datasets.length > 0) return;

		this.runQuery();

	    }
	);

    }

    runQuery() {

	this.definitions.datasetsQuery().subscribe(
	    // FIXME: any
	    (result : any) => {
		this.datasets = result;
	    }
	);

    }

    select(id : Value) {
	this.graph.includeNode(id as Uri);
    }

    // FIXME: Injectable in a non-read-only store
    handleKeyword(tag : string) {

	const qry = 'PREFIX schema: <https://schema.org/> SELECT DISTINCT ?s WHERE { ?s a schema:Dataset . ?s schema:keywords "' + tag + '" . } LIMIT 40';

	this.definitions.tagQuery(tag).subscribe(
	    (result : any) => {
		this.graph.includeTriples(result);
	    }
	);

    }

}

