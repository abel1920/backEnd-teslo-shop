import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        //ExecutionContext me permite toma imformacion de la petion en este caso el REQUEST

        const req = ctx.switchToHttp().getRequest()
        const user = req.user;

        if (!user)
            throw new InternalServerErrorException('User not found (request)')
        return (!data) ? user : user[data]

    }
);
