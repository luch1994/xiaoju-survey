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

import { DataStatisticService } from '../services/dataStatistic.service';
import { SurveyMetaService } from '../services/surveyMeta.service';
import { ResponseSchemaService } from '../../surveyResponse/services/responseScheme.service';

import { Authentication } from 'src/guards/authentication';
import { XiaojuSurveyPluginManager } from 'src/securityPlugin/pluginManager';
import { SurveyGuard } from 'src/guards/survey';
import { SurveyPermission } from 'src/enums/surveyPermission';

@ApiTags('survey')
@Controller('/api/survey/dataStatistic')
export class DataStatisticController {
  constructor(
    private readonly surveyMetaService: SurveyMetaService,
    private readonly responseSchemaService: ResponseSchemaService,
    private readonly dataStatisticService: DataStatisticService,
    private readonly pluginManager: XiaojuSurveyPluginManager,
  ) {}

  @Get('/dataTable')
  @HttpCode(200)
  @UseGuards(SurveyGuard)
  @SetMetadata('surveyId', 'query.surveyId')
  @SetMetadata('surveyPermission', [SurveyPermission.SURVEY_DATA_MANAGE])
  @UseGuards(Authentication)
  async data(
    @Query()
    queryInfo,
  ) {
    const validationResult = await Joi.object({
      surveyId: Joi.string().required(),
      isDesensitive: Joi.boolean().default(true), // 默认true就是需要脱敏
      page: Joi.number().default(1),
      pageSize: Joi.number().default(10),
    }).validateAsync(queryInfo);
    const { surveyId, isDesensitive, page, pageSize } = validationResult;
    const responseSchema =
      await this.responseSchemaService.getResponseSchemaByPageId(surveyId);
    const { total, listHead, listBody } =
      await this.dataStatisticService.getDataTable({
        responseSchema,
        surveyId,
        pageNum: page,
        pageSize,
      });

    if (isDesensitive) {
      // 脱敏
      listBody.forEach((item) => {
        this.pluginManager.triggerHook('desensitiveData', item);
      });
    }

    return {
      code: 200,
      data: {
        total,
        listHead,
        listBody,
      },
    };
  }
}
