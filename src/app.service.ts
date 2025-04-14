import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; links: Record<string, string> } {
    return {
      message: 'Bienvenue sur l\'API NJI Auto Pro',
      links: {
        graphqlPlayground: '/graphql',
        documentation: '/documentation',
        apiVersion: 'v1.0.0',
      },
    };
  }
}
