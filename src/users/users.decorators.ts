import { Inject } from '@nestjs/common';
import { PROVIDER_NAME } from 'src/lib/constants';

export const USERS = () => Inject(PROVIDER_NAME.USERS);
