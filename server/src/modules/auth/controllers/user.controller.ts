import { Controller, Get, Query, HttpCode, UseGuards } from '@nestjs/common';

import * as Joi from 'joi';
import { ApiTags } from '@nestjs/swagger';
import { Authentication } from 'src/guards/authentication';

import { EXCEPTION_CODE } from 'src/enums/exceptionCode';
import { HttpException } from 'src/exceptions/httpException';

import { UserService } from '../services/user.service';

@ApiTags('user')
@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(Authentication)
  @Get('/getUserList')
  @HttpCode(200)
  async getUserList(
    @Query()
    queryInfo,
  ) {
    const { value, error } = Joi.object({
      username: Joi.string().required(),
    }).validate(queryInfo);
    if (error) {
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }

    const userList = await this.userService.getuserListByUsername(
      value.username,
    );

    return {
      code: 200,
      data: userList,
    };
  }
}
