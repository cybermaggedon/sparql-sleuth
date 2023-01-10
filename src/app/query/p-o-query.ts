
import { Observable } from 'rxjs';

import { Query, QueryResult, QueryEngine } from './query';
import { Triple, Uri, Value } from '../rdf/triple';

export class POQuery implements Query {
    constructor(
	desc : string,
	p : Value,
	o : Value,
	limit : number = 100
    ) {
	this.p = p;
	this.o = o;
	this.desc = desc;
	this.limit = limit;
    }
    p : Value;
    o : Value;
    desc : string;
    limit : number = 100;
    description() { return this.desc; }
    hash() : string {
	return "p-o-q " + this.p.hash() + " " + this.o.hash() + " " + this.limit;
    }

    
    // FIXME: This is injectable
    // However, not using it against any sensitive data or stores, currently.
    getQueryString() : string {

	let query = "";

	query += "SELECT DISTINCT ?s WHERE {\n";
	query += "  ?s " + this.p.term() + " " + this.o.term() + " .\n";

	query += "}\n";
	query += "LIMIT " + this.limit + "\n";

	query = encodeURIComponent(query);
	return "query=" + query + "&output=json";

    };

    run(q : QueryEngine) : Observable<QueryResult> {
	return q.query(this);
    }

}

