
import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';

import { Uri, Value } from '../rdf/triple';
import { Row } from '../query/query';

import { DefinitionsService } from './definitions.service';

@Injectable({
  providedIn: 'root'
})
export class SchemaService {

    constructor(
	private definitions: DefinitionsService
    ) { }

    // FIXME: xCould cache, won't need to, it's cached at query layer.
    getSchema() {

	return this.definitions.schemaQuery();
	
    }

}


