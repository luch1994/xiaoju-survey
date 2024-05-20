import {
  Controller,
  Get,
  Query,
  HttpCode,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import * as Joi from 'joi';
import { ApiTags } from '@nestjs/swagger';

import { SurveyHistoryService } from '../services/surveyHistory.service';
import { SurveyMetaService } from '../services/surveyMeta.service';

import { Authentication } from 'src/guards/authentication';
import { SurveyGuard } from 'src/guards/survey';
import { SurveyPermission } from 'src/enums/surveyPermission';

@ApiTags('survey')
@Controller('/api/surveyHisotry')
export class SurveyHistoryController {
  constructor(
    private readonly surveyHistoryService: SurveyHistoryService,
    private readonly surveyMetaService: SurveyMetaService,
  ) {}

  @Get('/getList')
  @HttpCode(200)
  @UseGuards(SurveyGuard)
  @SetMetadata('surveyId', 'query.surveyId')
  @SetMetadata('surveyPermission', [SurveyPermission.SURVEY_CONF_MANAGE])
  @UseGuards(Authentication)
  async getList(
    @Query()
    queryInfo: {
      surveyId: string;
      historyType: string;
    },
  ) {
    const validationResult = await Joi.object({
      surveyId: Joi.string().required(),
      historyType: Joi.string().required(),
    }).validateAsync(queryInfo);

    const surveyId = validationResult.surveyId;
    const historyType = validationResult.historyType;
    const data = await this.surveyHistoryService.getHistoryList({
      surveyId,
      historyType,
    });
    return {
      code: 200,
      data,
    };
  }
}
