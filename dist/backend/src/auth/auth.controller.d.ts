import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("@ishub/shared").ILoginResponse>;
    login(dto: LoginDto): Promise<import("@ishub/shared").ILoginResponse>;
}
