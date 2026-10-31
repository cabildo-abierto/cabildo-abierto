import express, {type RequestHandler} from 'express';
import {apiContract, type ApiOperation, type ApiPath, type HttpMethod, type OperationContract} from '@cabildo-abierto/api';
import {handleOperation, type ContractHandler} from './handler.js';

type ApiMethod<Method extends HttpMethod> = {
    <Path extends ApiPath<Method>>(path: Path, handler: ContractHandler<ApiOperation<Method, Path>>): void;
    <Path extends ApiPath<Method>>(path: Path, middleware: RequestHandler, handler: ContractHandler<ApiOperation<Method, Path>>): void;
};
type ApiRouter = {
    router: express.Router;
    get: ApiMethod<'get'>;
    post: ApiMethod<'post'>;
    patch: ApiMethod<'patch'>;
    delete: ApiMethod<'delete'>;
};

export function createApiRouter(router: express.Router = express.Router()): ApiRouter {
    function register<Method extends 'get' | 'post' | 'patch' | 'delete'>(method: Method) {
        return (path: ApiPath<Method>, ...handlers: unknown[]) => {
            const handler = handlers.pop() as ContractHandler<OperationContract>;
            const operations = apiContract[path] as Partial<Record<HttpMethod, OperationContract>>;
            const contract = operations[method];
            if (!contract) throw new Error(`Missing API contract: ${method.toUpperCase()} ${path}`);
            router[method](path, ...handlers as RequestHandler[], handleOperation(contract, handler));
        };
    }
    return {router, get: register('get'), post: register('post'), patch: register('patch'), delete: register('delete')};
}
