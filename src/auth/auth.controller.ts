import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  signin(@Req() req: Request) {
    console.log(req);
    return this.authService.signUp();
  }

  @Post('signup')
  signup() {
    return this.authService.signUp();
  }
}
