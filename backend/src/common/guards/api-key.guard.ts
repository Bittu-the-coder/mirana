import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('INTERNAL_API_KEY');

    // If no API key is set in env, we might want to skip or fail secure.
    // Assuming fail secure if provided, but if env is missing, maybe allow for dev?
    // User requested "backend api only run from frontend if frontend has the api key",
    // so we should enforce it.

    if (!validApiKey) {
        // If config is missing, maybe log warning but allow? Or block?
        // Blocking is safer.
        console.warn('INTERNAL_API_KEY is not set in backend environment!');
        return false;
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
