import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  hiAuth() {
    return { msg: 'this is the auth hi' };
  }
}
