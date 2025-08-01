import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'response_message';
export const RESPONSE_TRANSFORM_KEY = 'response_transform';

export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);

export const SkipTransform = () => SetMetadata(RESPONSE_TRANSFORM_KEY, false);
