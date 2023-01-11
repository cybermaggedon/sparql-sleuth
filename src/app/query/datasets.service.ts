
import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';

import { Uri, Value } from '../rdf/triple';
import { Row } from '../query/query';

import { DefinitionsService } from './definitions.service';

export interface Dataset {
    dataset : Uri;
    title : string;
    description : string;
    author : string;
    keywords : string[];
};

@Injectable({
  providedIn: 'root'
})
export class DatasetsService {

    constructor(
	private definitions: DefinitionsService
    ) { }

    // FIXME: xCould cache, won't need to, it's cached at query layer.
    getDatasets() {

	return this.definitions.datasetsQuery().pipe(
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
	    )),
	);
	
    }

}


