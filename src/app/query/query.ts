
import { Value } from '../rdf/triple';
import { Observable } from 'rxjs';

export type Row = {
// FIXME: Should be value
    [key : string] : any
};

export class QueryResult {
    vars : string[] = [];
    data : Row[] = [];
};

export interface Query {
    description() : string;
    getQueryString() : string;
    hash() : string;
    decode(res : any) : any;

    // Return type is variable.
    // FIXME: Standardise on QueryResult? Vary in transforms?
    run(qe : QueryEngine): Observable<any>;
};

export interface QueryEngine {
    query(q : Query) : Observable<QueryResult>;
};


