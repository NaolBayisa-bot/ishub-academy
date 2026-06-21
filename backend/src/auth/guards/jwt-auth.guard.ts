import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IAuthPayload } from '@ishub/shared';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super('jwt');
  }
}