import { Controller, Post, Body, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './auth.guard';
import { Response } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signup(createUserDto, res);
  }

  @Post('signin')
  async login(@Body() loginUserDto: LoginUserDto, @Res({passthrough: true}) res: Response) {
    return this.authService.login(loginUserDto, res);
  }

  @Get('getuser')
  @UseGuards(AuthGuard)
  async getUser(@Req() req: any) {
    const userId: string = req.user.id;
    return this.authService.getUser(userId);
  }
}
