export enum SurveyPermission {
  SURVEY_CONF_MANAGE = 'surveyConfManage',
  SURVEY_DATA_MANAGE = 'surveyDataManage',
  SURVEY_COOPERATION_MANAGE = 'surveyCooperationManage',
}

export const surveyPermissionMap = {
  surveyConfManage: {
    name: '问卷配置管理',
  },
  surveyDataManage: {
    name: '问卷数据管理',
  },
  surveyCooperationManage: {
    name: '问卷协作管理',
  },
};
