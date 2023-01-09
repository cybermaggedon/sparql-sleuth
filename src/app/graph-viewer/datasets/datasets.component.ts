import { Component, OnInit } from '@angular/core';

import { forkJoin, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A, CLASS } from '../../rdf/defs';
import { Uri, Literal, Value } from '../../rdf/triple';
import { Row, QueryResult } from '../../query/query';

import { QueryService } from '../../query/query.service';
import { GraphService } from '../../graph/graph.service';
import { TransformService } from '../../transform/transform.service';
import { DefinitionsService } from '../../query/definitions.service';
import { CommandService, Command } from '../../command.service';

interface Dataset {
    dataset : Uri;
    title : string;
    description : string;
    author : string;
    keywords : string[];
};

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
		// Load datasets on first command.
		if (this.datasets.length > 0) return;
		this.runQuery();
	    }
	);

    }

    runQuery() {

	this.definitions.datasetsQuery().pipe(
	    map((x : any) => x.data),
	    map((res : Row[]) : Dataset[] => res.map(
		(row : any) : Dataset => {
		    return {
			dataset: row["dataset"],
			title: row["title"].value(),
			description: row["description"].value(),
			author: row["author"].value(),
			keywords: row["keywords"].map(
			    (k : Value) => k.value()
			),
		    };
		}
	    ))
	).subscribe(
	    (result : Dataset[]) => {
		this.datasets = result;
	    }
	);

    }

    select(id : Uri) {
	this.graph.includeNode(id as Uri);
    }

    filterby = "";

    handleKeyword(tag : string) {

	this.definitions.tagQuery(new Literal(tag)).subscribe(
	    (result : any) => {
		this.graph.includeTriples(result);
	    }
	);

    }

}

