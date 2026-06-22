import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthPayload } from '@ishub/shared';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: IAuthPayload): Promise<{
        userId: number;
        email: string;
        role: import("@ishub/shared").Role;
        status: import("@ishub/shared").UserStatus;
    }>;
}
export {};
