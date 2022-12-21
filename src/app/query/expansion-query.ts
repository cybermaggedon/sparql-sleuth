
import { Query } from './query';
import { Value } from './triple';

export class ExpansionsQuery implements Query {
    constructor(
	desc : string,
	id : string,
	inward : boolean,
	limit : number = 100
    ) {
	this.id = id;
	this.inward = inward;
	this.desc = desc;
	this.limit = limit;
    }
    id : string;
    inward : boolean;
    desc : string;
    limit : number = 100;
    description() { return this.desc; }
    hash() : string {
	return "eq " +  this.id + " " + this.inward + " " + this.limit;
    }

    
    // FIXME: This is injectable
    // However, not using it against any sensitive data or stores, currently.
    getQueryString() : string {

	let query = "";

	query += "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
	query += "SELECT DISTINCT ?pred WHERE {\n";

	if (this.inward)
	    query += "  ?s ?pred <" + this.id + "> . \n";
	else {
	    query += "  <" + this.id + "> ?pred ?o . \n";
	    
	    // Only want links to URIs, not literals.
	    // FIXME, filter out thumbnails and references?
	    query += "  FILTER(isIRI(?o)) .\n";
	}

	query += "}\n";
	query += "LIMIT " + this.limit + "\n";

	query = encodeURIComponent(query);

	return "query=" + query + "&output=json";

    }

    decode(res : any) : any {

	let values : Value[] = [];

	for (let row of res.results.bindings) {
	    let pred = new Value(row.pred.value, true);
	    values.push(pred);
	}

	return values;

    }
	
}

