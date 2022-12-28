
import { Query } from './query';
import { Triple, Uri, Value } from './triple';

export class RawQuery implements Query {
    constructor(
	desc : string,
	qry : string,
    ) {
	this.qry = qry;
	this.desc = desc;
    }
    desc : string;
    qry : string;
    description() { return this.desc; }
    hash() : string {
	return "rq " +  this.qry;
    }
    
    getQueryString() : string {

	let query = this.qry;

	query = encodeURIComponent(query);

	return "query=" + query + "&output=json";

    }

    decode(res : any) : any{

	let vars = res.head.vars;

	let ret : any[] = [];

	for (let row of res.results.bindings) {

	    let obj : any = {};
	    
	    for (let k in row) {

		if (row[k].type == "uri")
		    obj[k] = new Value(row[k].value, true);
		else
		    obj[k] = new Value(row[k].value, false);

	    }

	    ret.push(obj);

	}

	return {
	    vars: vars,
	    rows: ret,
	};

    }

}

