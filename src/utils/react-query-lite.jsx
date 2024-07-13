import React, { useEffect, useReducer } from "react";

const context = React.createContext();

export function QueryClientProvider({ children, client }) {
    return <context.Provider value={client}>{children}</context.Provider>;
}

export class QueryClient {
    constructor() {
        this.queries = [];
    }

    getQuery = (options) => {
        const queryHash = JSON.stringify(options.queryKey);
        let query = this.queries.find((d) => d.queryHash === queryHash);
        if (!query) {
            query = createQuery(this, options);
            this.queries.push(query);
        }
        return query;
    };
}

export function useQuery({queryKey,queryFn,staleTime,cacheTime}) {
    const client = React.useContext(context)
    const observerRef = React.useRef(null)
    const [_,rerender] = React.useReducer(i=>i+1,0)

    if(!observerRef.current){
        observerRef.current = createQueryObserver(client,{queryKey,queryFn,staleTime,cacheTime})
    }

    useEffect(()=>{
        return observerRef.current.subscribe(rerender)
    },[])

    return observerRef.current.getResult()


}

function createQuery(client, { queryKey, queryFn, cacheTime=50 * 60 * 1000 }) {
    let query = {
        queryKey,
        queryHash: JSON.stringify(queryKey),
        promise: null,
        gcTimeout:null,
        subscribers: [],
        state: {
            status: "loading",
            isFetching: true,
            data: undefined,
            error: undefined,
        },
        subscribe: (subscriber) => {
            query.subscribers.push(subscriber);
            query.unScheduleGC()
            return () => {
                query.subscribers = query.subscribers.filter(
                    (s) => s !== subscriber,
                );
                if(!query.subscribers.length){
                    query.scheduclGC()
                }
            };
        },
        scheduclGC:()=>{
            query.gcTimeout = setTimeout(()=>{
                client.queries = client.queries.filter(q=>q !== query)
                client.notify()
            },cacheTime)
        },
        unScheduleGC:()=>{
            clearTimeout(query.gcTimeout)
        },
        setState: (updater) => {
            query.state = updater(query.state);
            query.subscribers.forEach((subscriber) => subscriber.notify());
            client.notify()
            // console.log({nf:client.notify})
            // query.notify()
        },
        fetch: () => {
            if (!query.promise) {
                query.promise = (async () => {
                    query.setState((old) => ({
                        ...old,
                        error: undefined,
                        isFetching:true,
                    }));

                    try {
                        const data = await queryFn();
                        query.setState((old) => ({
                            ...old,
                            status: "success",
                            data,
                            lastUpdated: Date.now(),
                        }));

                    } catch (error) {
                        query.setState((old) => ({
                            ...old,
                            status: "error",
                            error,
                        }));

                    } finally {
                        query.promise = null;
                        query.setState((old) => ({
                            ...old,
                            isFetching: false,
                        }));
                    }
                })();
            }
            return query.promise;
        },
    };

    return query;
}

function createQueryObserver(client, { queryKey, queryFn, staleTime, cacheTime }) {
    const query = client.getQuery({ queryKey, queryFn, cacheTime });

    let observer = {
        notify: () => {},
        getResult: () => query.state,
        subscribe: (cb) => {
            observer.notify = cb
            // query.notify = cb
            const unsubscribe = query.subscribe(observer)
            observer.fetch()
            return unsubscribe
        },
        fetch:()=>{
            if(!query.state.lastUpdated || Date.now() - query.state.lastUpdated > staleTime){
                query.fetch()
            }
        }
    };
    return observer;
}

export function ReactQueryDevtools() {}
