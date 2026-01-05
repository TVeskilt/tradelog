import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/${process.env.NODE_ENV || 'development'}.env`,
      isGlobal: true,
      expandVariables: true,
    }),
  ],
})
export class ConfigModule {}
