import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import * as Joi from 'joi';

import { Authentication } from 'src/guards/authentication.guard';
import { HttpException } from 'src/exceptions/httpException';
import { EXCEPTION_CODE } from 'src/enums/exceptionCode';
import { SurveyGuard } from 'src/guards/survey.guard';
import {
  SURVEY_PERMISSION,
  SURVEY_PERMISSION_DESCRIPTION,
} from 'src/enums/surveyPermission';
import { Logger } from 'src/logger';

import { CollaboratorService } from '../services/collaborator.service';
import { UserService } from 'src/modules/auth/services/user.service';

import { CreateCollaboratorDto } from '../dto/createCollaborator.dto';
import { ChangeUserPermissionDto } from '../dto/changeUserPermission.dto';
import { GetSurveyCollaboratorListDto } from '../dto/getSurveyCollaboratorList.dto';

@UseGuards(Authentication)
@ApiTags('collaborator')
@ApiBearerAuth()
@Controller('/api/collaborator')
export class CollaboratorController {
  constructor(
    private readonly collaboratorService: CollaboratorService,
    private readonly logger: Logger,
    private readonly userService: UserService,
  ) {}

  @Get('getPermissionList')
  async getPermissionList() {
    const vals = Object.values(SURVEY_PERMISSION_DESCRIPTION);
    return {
      code: 200,
      data: vals,
    };
  }

  @Post('')
  @UseGuards(SurveyGuard)
  @SetMetadata('surveyId', 'body.surveyId')
  @SetMetadata('surveyPermission', [
    SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
  ])
  async addCollaborator(
    @Body() reqBody: CreateCollaboratorDto,
    @Request() req,
  ) {
    const { error, value } = CreateCollaboratorDto.validate(reqBody);
    if (error) {
      this.logger.error(error.message, { req });
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }

    // 检查用户是否存在
    const user = await this.userService.getUserById(value.userId);
    if (!user) {
      throw new HttpException('用户不存在', EXCEPTION_CODE.USER_NOT_EXISTS);
    }

    if (user.username === req.surveyMeta.owner) {
      throw new HttpException(
        '不能给问卷所有者授权',
        EXCEPTION_CODE.PARAMETER_ERROR,
      );
    }

    const collaborator = await this.collaboratorService.getCollaborator({
      userId: value.userId,
      surveyId: value.surveyId,
    });

    if (collaborator) {
      throw new HttpException(
        '用户已经是协作者',
        EXCEPTION_CODE.PARAMETER_ERROR,
      );
    }

    const res = await this.collaboratorService.create(value);

    return {
      code: 200,
      data: {
        collaboratorId: res._id.toString(),
      },
    };
  }

  @Get('')
  @UseGuards(SurveyGuard)
  @SetMetadata('surveyId', 'query.surveyId')
  @SetMetadata('surveyPermission', [
    SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
  ])
  async getSurveyCollaboratorList(
    @Query() query: GetSurveyCollaboratorListDto,
    @Request() req,
  ) {
    const { error, value } = GetSurveyCollaboratorListDto.validate(query);
    if (error) {
      this.logger.error(error.message, { req });
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }

    const res = await this.collaboratorService.getSurveyCollaboratorList(value);

    return {
      code: 200,
      data: res,
    };
  }

  @Post('changeUserPermission')
  @UseGuards(SurveyGuard)
  @SetMetadata('surveyId', 'body.surveyId')
  @SetMetadata('surveyPermission', [
    SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
  ])
  async changeUserPermission(
    @Body() reqBody: ChangeUserPermissionDto,
    @Request() req,
  ) {
    const { error, value } = Joi.object({
      surveyId: Joi.string(),
      userId: Joi.string(),
      permissions: Joi.array().items(Joi.string().required()),
    }).validate(reqBody);
    if (error) {
      this.logger.error(error.message, { req });
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }

    const res = await this.collaboratorService.changeUserPermission(value);

    return {
      code: 200,
      data: res,
    };
  }

  @Post('deleteCollaborator')
  @UseGuards(SurveyGuard)
  @SetMetadata('surveyId', 'body.surveyId')
  @SetMetadata('surveyPermission', [
    SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
  ])
  async deleteCollaborator(@Query() query, @Request() req) {
    const { error, value } = Joi.object({
      surveyId: Joi.string(),
      userId: Joi.string(),
    }).validate(query);
    if (error) {
      this.logger.error(error.message, { req });
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }

    const res = await this.collaboratorService.deleteCollaborator(value);

    return {
      code: 200,
      data: res,
    };
  }
}
