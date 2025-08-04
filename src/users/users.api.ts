import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { BASE_API_URL } from 'src/lib/constants';
import { GetAllUserResponseDto } from './dto/get-all-user-response.dto';

@Injectable()
export class UsersApi {
  async findAll() {
    const response = await axios.get<GetAllUserResponseDto[]>(
      `${BASE_API_URL}/users`,
    );
    return response.data;
  }
}
