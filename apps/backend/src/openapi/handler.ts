import type {NextFunction, Request, RequestHandler, Response} from 'express';
import type {z} from 'zod';
import type {OperationContract, APIError, ErrorStatus} from '@cabildo-abierto/api';

type RequestPart<Contract, Part extends 'path' | 'query'> =
    Contract extends {requestParams: Record<Part, infer Schema extends z.ZodType>} ? z.output<Schema> : Record<never, never>;
type JsonBody<Content> = Content extends {content: {'application/json': {schema: infer Schema extends z.ZodType}}}
    ? z.output<Schema> : never;
type StatusCode<Contract extends OperationContract> = keyof Contract['responses'] extends infer Key
    ? Key extends `${infer Code extends number}` ? Code : never : never;
type ResponseBody<Contract extends OperationContract, Code extends number> =
    JsonBody<Contract['responses'][`${Code}` & keyof Contract['responses']]>;

type ContractResponse<Contract extends OperationContract, Code extends number = 200> =
    Omit<Response<ResponseBody<Contract, Code>>, 'status' | 'sendStatus'> & {
        status<Status extends StatusCode<Contract>>(code: Status): ContractResponse<Contract, Status>;
    };
type ContractRequest<Contract extends OperationContract> = Request<
    RequestPart<Contract, 'path'>,
    unknown,
    Contract extends {requestBody: infer Body} ? JsonBody<Body> | (Body extends {required: false} ? undefined : never) : never,
    RequestPart<Contract, 'query'>
>;
export type ContractHandler<Contract extends OperationContract> = (
    req: ContractRequest<Contract>,
    res: ContractResponse<Contract>,
    next: NextFunction,
) => unknown;

export function handleOperation<Contract extends OperationContract>(contract: Contract, handler: ContractHandler<Contract>): RequestHandler {
    return (req, res, next) => {
        const request = req as Request & {openapi?: {schema?: {operationId?: string}}};
        if (request.openapi?.schema?.operationId !== contract.operationId) {
            next(new Error(`OpenAPI validation is required before handling ${contract.operationId}.`));
            return;
        }
        // The OpenAPI middleware validates and coerces inputs before this boundary.
        // Express cannot infer these types or correlate status codes with JSON bodies.
        return handler(req as unknown as ContractRequest<Contract>, res as unknown as ContractResponse<Contract>, next);
    };
}

export type ErrorResponder = {status(code: ErrorStatus): {json(body: APIError): unknown}};
export type PendingErrorResponder = ErrorResponder & {status(code: 202): {json(body: {success: true; pending: true; state: string}): unknown}};
