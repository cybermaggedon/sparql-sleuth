
import { Observable, map } from 'rxjs';

import { Query, QueryResult, QueryEngine } from './query';
import { Triple, Uri, Value } from '../rdf/triple';

export class LabelQuery implements Query {
    constructor(
	desc : string,
	id : Value,
	limit : number = 10
    ) {
	this.id = id;
	this.desc = desc;
	this.limit = limit;
    }
    id : Value;
    desc : string;
    limit : number = 1;
    description() { return this.desc; }
    hash() : string {
	return "lq " +  this.id.hash() + " " + this.limit;
    }

    
    // FIXME: This is injectable
    // However, not using it against any sensitive data or stores, currently.
    getQueryString() : string {

	let query = "";

	query += "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"

	query += "SELECT DISTINCT ?label WHERE {\n";
	query += "  " + this.id.term() + " rdfs:label ?label .\n";
	query += "}\n";
	query += "LIMIT " + this.limit + "\n";

	query = encodeURIComponent(query);
	return "query=" + query + "&output=json";

    }

    run(q : QueryEngine) : Observable<QueryResult> {
	return q.query(this);
    }

}

