export enum SURVEY_PERMISSION {
  SURVEY_CONF_MANAGE = 1001,
  SURVEY_RESPONSE_MANAGE = 1002,
  SURVEY_COOPERATION_MANAGE = 1003,
}

export const SURVEY_PERMISSION_DESCRIPTION = {
  SURVEY_CONF_MANAGE: {
    name: '问卷配置管理',
    value: SURVEY_PERMISSION.SURVEY_CONF_MANAGE,
  },
  surveyDataManage: {
    name: '问卷数据管理',
    value: SURVEY_PERMISSION.SURVEY_RESPONSE_MANAGE,
  },
  surveyCooperationManage: {
    name: '问卷协作管理',
    value: SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
  },
};
