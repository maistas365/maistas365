import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}

  @Get('hi')
  hiAuth() {
    return this.AuthService.hiAuth();
  }
}
