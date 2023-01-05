
import { Component, OnInit } from '@angular/core';

import { map } from 'rxjs/operators';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A, CLASS } from '../../rdf/defs';
import { Uri } from '../../rdf/triple';
import { POQuery } from '../../query/p-o-query';
import { Row } from '../../query/query';

import { GraphService } from '../../graph/graph.service';
import { CommandService, Command } from '../../command.service';
import { DefinitionsService } from '../../query/definitions.service';

@Component({
  selector: 'schema',
  templateUrl: './schema.component.html',
  styleUrls: ['./schema.component.scss']
})
export class SchemaComponent implements OnInit {

    constructor(
	private graph : GraphService,
	private command : CommandService,
	private definitions : DefinitionsService,
    ) { }

    schema : Row[] = [];

    ngOnInit(): void {

	this.command.command(Command.SCHEMA).subscribe(
	    () => {
		if (this.schema.length > 0) return;
		this.runQuery();
	    }
	);

    }

    runQuery() {

	let schemaQuery = this.definitions.schemaQuery();

	schemaQuery.subscribe(
	    (result : any) => {
		this.schema = result;
	    }
	);

    }

    select(id : Uri) {
	this.graph.includeNode(id);
    }

}

