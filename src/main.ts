import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ErrorTransformInterceptor } from './common/interceptors/error-transform.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(
    new ErrorTransformInterceptor(),
    new ResponseTransformInterceptor(app.get(Reflector)),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
