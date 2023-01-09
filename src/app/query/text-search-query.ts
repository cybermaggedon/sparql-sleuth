
import { Observable } from 'rxjs';

import { Query, QueryResult, QueryEngine } from './query';
import { Value, Uri, Literal, Triple } from '../rdf/triple';

export class TextSearchQuery implements Query {
    constructor(
	desc : string,
	text : Value,
	limit : number = 100
    ) {
	this.desc = desc;
	this.text = text;
	this.limit = limit;
    }
    desc : string;
    text : Value;
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
	query += "    CONTAINS(?o, " + this.text.term() + ")";
	query += "  ) 	";

	query += "}\n";
	query += "LIMIT " + this.limit + "\n";

	query = encodeURIComponent(query);

	return "query=" + query + "&output=json";

    }

    run(q : QueryEngine) : Observable<QueryResult> {
	return q.query(this);
    }

    decode(res : any) : any{
      return res;
    }

}
