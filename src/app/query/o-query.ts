
import { Observable } from 'rxjs';

import { Query, QueryResult } from './query';
import { QueryService } from './query.service';
import { Triple, Uri, Value } from '../rdf/triple';

export class OQuery implements Query {
    constructor(
	desc : string,
	o : Value,
	limit : number = 100
    ) {
	this.o = o;
	this.desc = desc;
	this.limit = limit;
    }
    o : Value;
    desc : string;
    limit : number = 100;
    description() { return this.desc; }
    hash() : string {
	return "o-q " + this.o.hash() + " " + this.limit;
    }

    
    // FIXME: This is injectable
    // However, not using it against any sensitive data or stores, currently.
    getQueryString() : string {

	let query = "";

	query += "SELECT DISTINCT ?s ?p WHERE {\n";
	query += "  ?s ?p " + this.o.term() + " .\n";

	query += "}\n";
	query += "LIMIT " + this.limit + "\n";

	query = encodeURIComponent(query);
	return "query=" + query + "&output=json";

    };

    run(q : QueryService) : Observable<QueryResult> {
	return q.query(this);
    }

    decode(res : QueryResult) : any {
	return res;
    }

}

