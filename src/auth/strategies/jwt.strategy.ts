import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class JwtStategy extends PassportStrategy(Strategy) {

    /*   PassportStrategy(Strategy), NestJS y Passport registran tu 
    clase como una estrategia llamada 'jwt'(por defecto, porque usas
     el Strategy de passport-jwt).
   */
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET') as string,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }
    async validate(payload: JwtPayload): Promise<User> {

        // const { email } = payload 
        const { id } = payload
        //Buscar el usuario por id 
        const user = await this.userRepository.findOneBy({ id })
        if (!user)
            throw new UnauthorizedException('Token not valid')
        if (!user.isActive)
            throw new UnauthorizedException('User is inactive,talk with an admin')

        return user;

    }
}