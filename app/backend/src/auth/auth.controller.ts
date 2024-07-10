import { Controller } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    hiAuth(){
        return "this the auth module";
    }
}
