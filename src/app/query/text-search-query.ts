
import { Observable } from 'rxjs';

import { Query, QueryResult } from './query';
import { QueryService } from './query.service';
import { Value, Uri, Literal, Triple } from '../rdf/triple';

export class TextSearchQuery implements Query {
    constructor(
	desc : string,
	text : string,
	limit : number = 100
    ) {
	this.desc = desc;
	this.text = text;
	this.limit = limit;
    }
    desc : string;
    text : string;
    limit : number = 100;
    description() { return this.desc; }

    hash() : string {
	return "ts " +  this.text + " " + this.limit;
    }

    
    // FIXME: This is injectable
    // However, not using it against any sensitive data or stores, currently.
    getQueryString() : string {

	let query = "";

	query += "SELECT DISTINCT ?s ?p ?o WHERE {\n";

	query += "  ?s ?p ?o .\n";

	query += "  FILTER (";
	query += "    !isIRI(?o) &&";
	query += "    CONTAINS(?o, \"" + this.text + "\")";
	query += "  ) 	";

	query += "}\n";
	query += "LIMIT " + this.limit + "\n";

	query = encodeURIComponent(query);

	return "query=" + query + "&output=json";

    }

    run(q : QueryService) : Observable<QueryResult> {
	return q.query(this);
    }

    decode(res : any) : any{
      return res;
    }

}
