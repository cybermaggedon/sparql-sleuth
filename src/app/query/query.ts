
export interface Query {
    description() : string;
    getQueryString() : string;
    hash() : string;
    decode(res : any) : any 
};

