import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        //ExecutionContext me permite toma imformacion de la petion en este caso el REQUEST

        const req = ctx.switchToHttp().getRequest()
        return req.rawHeaders;


    }
);
