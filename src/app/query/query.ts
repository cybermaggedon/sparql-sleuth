
import { Value } from '../rdf/triple';

export type Row = {
    [key : string] : Value
};

export class QueryResult {
    vars : string[] = [];
    data : Row[] = [];
};

export interface Query {
    description() : string;
    getQueryString() : string;
    hash() : string;
    decode(res : any) : any 
};

