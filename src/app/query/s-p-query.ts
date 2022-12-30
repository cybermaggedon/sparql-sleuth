
import { Observable } from 'rxjs';

import { Query, QueryResult } from './query';
import { QueryService } from './query.service';
import { Triple, Uri, Value } from './triple';

export class SPQuery implements Query {
    constructor(
	desc : string,
	s : Value,
	p : Value,
	limit : number = 100
    ) {
	this.s = s;
	this.p = p;
	this.desc = desc;
	this.limit = limit;
    }
    s : Value;
    p : Value;
    desc : string;
    limit : number = 100;
    description() { return this.desc; }
    hash() : string {
	return "s-p-q " + this.s.hash() + " " + this.p.hash() + " " + this.limit;
    }

    
    // FIXME: This is injectable
    // However, not using it against any sensitive data or stores, currently.
    getQueryString() : string {

	let query = "";

	query += "SELECT DISTINCT ?o WHERE {\n";
	query += "  " + this.s.term() + " " + this.p.term() + " ?o .\n";

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

