
import { Value } from './triple';

export class QueryResult {
    vars : string[] = [];
    data : {
	[key : string] : Value
    }[] = [];
};

export interface Query {
    description() : string;
    getQueryString() : string;
    hash() : string;
    decode(res : any) : any 
};

