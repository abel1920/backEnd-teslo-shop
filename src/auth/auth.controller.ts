import { Controller, Get, Post, Body, UseGuards, Request, SetMetadata, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Auth, GetUser, RawHeaders } from './decorators';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { ApiTags } from '@nestjs/swagger';

//@ApiTags('Products')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {

    return this.authService.login(loginUserDto)
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user)
  }

  @Get('private')
  //Guard Propio
  @UseGuards(AuthGuard())
  testingPrivate(
    @GetUser('fullName') userEmail: string,
    @GetUser() user: User,
    @RawHeaders() rawHeaders: string[]) {
    //console.log({usuario:user} )
    return {
      ok: true,
      message: 'Hola Mundo Privado',
      userEmail: userEmail,
      Rawheaders: rawHeaders,
      user,
    }
  }

  //@SetMetadata('roles',['admin','super-user'])
  @Get('private2')
  //  @RoleProtected(ValidRoles.user)
  @RoleProtected()
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      user
    }
  }

  @Get('private3')
  //  @RoleProtected(ValidRoles.user)
  @Auth(ValidRoles.admin,)
  privateRoute3(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      user
    }
  }

}
