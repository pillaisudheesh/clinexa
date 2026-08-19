import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    console.log(
      'AUTH HEADER:',
      request.headers.authorization
        ? `${request.headers.authorization.substring(0, 30)}...`
        : 'MISSING',
    );

    return super.canActivate(context);
  }
}
