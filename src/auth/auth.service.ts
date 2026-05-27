import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, CreateUserDto } from './dto';
import e from 'express';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  constructor(

    //Injeccion de Dependencia
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }
  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userData } = createUserDto

      const user = this.userRepository.create({
        ...userData,
        //Encriptar la contraseña
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user)
      const { password: _, ...userWithoutPassword } = user
      return {
        ...userWithoutPassword,
        token: this.getJwtToken({ id: user.id })
      }


    } catch (error) {

      this.handleDBErrors(error)
    }

  }

  async login(loginUserDto: LoginUserDto) {

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }
    });

    if (!user) throw new UnauthorizedException('Credentials are not valid(email)')

    //Verifica la contraseña
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid(password)')
    //TODO: Retornar el JWT

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  private getJwtToken(payload: JwtPayload) {
    //Servicio de jwtService
    const token = this.jwtService.sign(payload);

    return token;

  }

  checkAuthStatus(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      token: this.getJwtToken({ id: user.id })
    }
  }

  //tipo de dato never jamas regresa valor
  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Please check server logs')
  }

}
