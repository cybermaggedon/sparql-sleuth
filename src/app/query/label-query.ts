
import { Observable, map } from 'rxjs';

import { Query } from './query';
import { QueryService } from './query.service';
import { Triple, Uri, Value } from './triple';

export class LabelQuery implements Query {
    constructor(
	desc : string,
	id : Uri,
	limit : number = 100
    ) {
	this.id = id;
	this.desc = desc;
	this.limit = limit;
    }
    id : Uri;
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

    run(q : QueryService) : Observable<string> {
	return q.query(this).pipe(
	    map(x => this.decode(x))
	);
    }

    decode(res : any) : any {

	if (res.results.bindings.length > 0)
	    return res.results.bindings[0].label.value;
	else
	    return null;

    }

}

