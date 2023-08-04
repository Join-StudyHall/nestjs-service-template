import { ConfigModule } from '@nestjs/config';
import configuration from '@app/app.config';
import {
  Module,
  ValidationPipe,
  UnprocessableEntityException,
} from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AppService } from '@app/app.service';
import { HealthModule } from '@app/health/health.module';
import { AllExceptionsFilter } from '@app/all-exceptions.filter';
import { ValidationError } from 'class-validator';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
      load: [configuration],
    }),
  ],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        exceptionFactory: (errors) => {
          const formattedErrors = formatErrors(errors);

          return new UnprocessableEntityException(formattedErrors);
        },
      }),
    },
    {
      provide: APP_FILTER,
      useValue: new AllExceptionsFilter(),
    },
  ],
})
export class AppModule {}

const formatErrors = (errors: ValidationError[], parentName = '') => {
  const formattedErrors = [];

  for (const error of errors) {
    if (Array.isArray(error.value) && !error.constraints) {
      formattedErrors.push(formatErrors(error.children, error.property));
    } else if (Array.isArray(error.children) && error.children.length) {
      const ob = { name: `${parentName}.${error.property}`, errors: [] };
      ob.errors = formatErrors(error.children);
      formattedErrors.push(ob);
    } else {
      const err = {};
      err[error.property] = Object.keys(error.constraints).map(
        (p) => error.constraints[p],
      );
      formattedErrors.push(err);
    }
  }

  return formattedErrors.flat();
};
