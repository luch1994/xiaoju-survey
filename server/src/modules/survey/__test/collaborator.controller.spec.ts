import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorController } from '../controllers/collaborator.controller';
import { CollaboratorService } from '../services/collaborator.service';
import { Logger } from 'src/logger';
import { HttpException } from 'src/exceptions/httpException';
import { CreateCollaboratorDto } from '../dto/createCollaborator.dto';
import { Collaborator } from 'src/models/collaborator.entity';
import { GetSurveyCollaboratorListDto } from '../dto/getSurveyCollaboratorList.dto';
import { UserService } from 'src/modules/auth/services/user.service';
import { ObjectId } from 'mongodb';
import { SurveyMetaService } from '../services/surveyMeta.service';
import { WorkspaceMemberService } from 'src/modules/workspace/services/workspaceMember.service';
import {
  SURVEY_PERMISSION,
  SURVEY_PERMISSION_DESCRIPTION,
} from 'src/enums/surveyPermission';
import { BatchSaveCollaboratorDto } from '../dto/batchSaveCollaborator.dto';

jest.mock('src/guards/authentication.guard');
jest.mock('src/guards/survey.guard');
jest.mock('src/guards/workspace.guard');

describe('CollaboratorController', () => {
  let controller: CollaboratorController;
  let collaboratorService: CollaboratorService;
  let logger: Logger;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaboratorController],
      providers: [
        {
          provide: CollaboratorService,
          useValue: {
            create: jest.fn(),
            getSurveyCollaboratorList: jest.fn(),
            changeUserPermission: jest.fn(),
            deleteCollaborator: jest.fn(),
            getCollaborator: jest.fn(),
            batchDeleteBySurveyId: jest.fn(),
            batchCreate: jest.fn(),
            batchDelete: jest.fn(),
            updateById: jest.fn(),
            batchSaveCollaborator: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
            info: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn().mockImplementation((id) => {
              return Promise.resolve({
                _id: new ObjectId(id),
              });
            }),
            getUserListByIds: jest.fn(),
          },
        },
        {
          provide: SurveyMetaService,
          useValue: {
            getSurveyById: jest.fn(),
          },
        },
        {
          provide: WorkspaceMemberService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    controller = module.get<CollaboratorController>(CollaboratorController);
    collaboratorService = module.get<CollaboratorService>(CollaboratorService);
    logger = module.get<Logger>(Logger);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addCollaborator', () => {
    it('should add a collaborator successfully', async () => {
      const userId = new ObjectId().toString();
      const reqBody: CreateCollaboratorDto = {
        surveyId: 'surveyId',
        userId: new ObjectId().toString(),
        permissions: [SURVEY_PERMISSION.SURVEY_CONF_MANAGE],
      };
      const req = { user: { _id: 'userId' }, surveyMeta: { ownerId: userId } };
      const result = { _id: 'collaboratorId' };

      jest
        .spyOn(collaboratorService, 'create')
        .mockResolvedValue(result as unknown as Collaborator);

      const response = await controller.addCollaborator(reqBody, req);

      expect(response).toEqual({
        code: 200,
        data: {
          collaboratorId: result._id,
        },
      });
    });

    it('should throw an exception if validation fails', async () => {
      const reqBody: CreateCollaboratorDto = {
        surveyId: '',
        userId: '',
        permissions: [SURVEY_PERMISSION.SURVEY_CONF_MANAGE],
      };
      const req = { user: { _id: 'userId' } };

      await expect(controller.addCollaborator(reqBody, req)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw an exception if user does not exist', async () => {
      const reqBody: CreateCollaboratorDto = {
        surveyId: 'surveyId',
        userId: new ObjectId().toString(),
        permissions: [SURVEY_PERMISSION.SURVEY_CONF_MANAGE],
      };
      const req = {
        user: { _id: 'userId' },
        surveyMeta: { ownerId: new ObjectId().toString() },
      };

      jest.spyOn(userService, 'getUserById').mockResolvedValue(null);

      await expect(controller.addCollaborator(reqBody, req)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw an exception if user is the survey owner', async () => {
      const userId = new ObjectId().toString();
      const reqBody: CreateCollaboratorDto = {
        surveyId: 'surveyId',
        userId: userId,
        permissions: [SURVEY_PERMISSION.SURVEY_CONF_MANAGE],
      };
      const req = { user: { _id: 'userId' }, surveyMeta: { ownerId: userId } };

      await expect(controller.addCollaborator(reqBody, req)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw an exception if user is already a collaborator', async () => {
      const userId = new ObjectId().toString();
      const reqBody: CreateCollaboratorDto = {
        surveyId: 'surveyId',
        userId: userId,
        permissions: [SURVEY_PERMISSION.SURVEY_CONF_MANAGE],
      };
      const req = {
        user: { _id: 'userId' },
        surveyMeta: { ownerId: new ObjectId().toString() },
      };

      jest
        .spyOn(collaboratorService, 'getCollaborator')
        .mockResolvedValue({} as unknown as Collaborator);

      await expect(controller.addCollaborator(reqBody, req)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getSurveyCollaboratorList', () => {
    it('should return collaborator list', async () => {
      const query = { surveyId: 'surveyId' };
      const req = { user: { _id: 'userId' } };
      const result = [
        { _id: 'collaboratorId', userId: 'userId', username: '' },
      ];

      jest
        .spyOn(collaboratorService, 'getSurveyCollaboratorList')
        .mockResolvedValue(result as unknown as Array<Collaborator>);

      jest.spyOn(userService, 'getUserListByIds').mockResolvedValueOnce([]);

      const response = await controller.getSurveyCollaboratorList(query, req);

      expect(response).toEqual({
        code: 200,
        data: result,
      });
    });

    it('should throw an exception if validation fails', async () => {
      const query: GetSurveyCollaboratorListDto = {
        surveyId: '',
      };
      const req = { user: { _id: 'userId' } };

      await expect(
        controller.getSurveyCollaboratorList(query, req),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeUserPermission', () => {
    it('should change user permission successfully', async () => {
      const reqBody = {
        surveyId: 'surveyId',
        userId: 'userId',
        permissions: ['read'],
      };
      const req = { user: { _id: 'userId' } };
      const result = { _id: 'userId', permissions: ['read'] };

      jest
        .spyOn(collaboratorService, 'changeUserPermission')
        .mockResolvedValue(result);

      const response = await controller.changeUserPermission(reqBody, req);

      expect(response).toEqual({
        code: 200,
        data: result,
      });
    });

    it('should throw an exception if validation fails', async () => {
      const reqBody = {
        surveyId: '',
        userId: '',
        permissions: ['surveyManage'],
      };
      const req = { user: { _id: 'userId' } };

      await expect(
        controller.changeUserPermission(reqBody, req),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteCollaborator', () => {
    it('should delete collaborator successfully', async () => {
      const query = { surveyId: 'surveyId', userId: 'userId' };
      const req = { user: { _id: 'userId' } };
      const result = { acknowledged: true, deletedCount: 1 };

      jest
        .spyOn(collaboratorService, 'deleteCollaborator')
        .mockResolvedValue(result);

      const response = await controller.deleteCollaborator(query, req);

      expect(response).toEqual({
        code: 200,
        data: result,
      });
    });

    it('should throw an exception if validation fails', async () => {
      const query = { surveyId: '', userId: '' };
      const req = { user: { _id: 'userId' } };

      await expect(controller.deleteCollaborator(query, req)).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  // 新增的测试方法
  describe('getPermissionList', () => {
    it('should return the permission list', async () => {
      const result = Object.values(SURVEY_PERMISSION_DESCRIPTION);

      const response = await controller.getPermissionList();

      expect(response).toEqual({
        code: 200,
        data: result,
      });
    });
  });

  describe('batchSaveCollaborator', () => {
    it('should save collaborators in batch successfully', async () => {
      const reqBody: BatchSaveCollaboratorDto = {
        surveyId: '',
        collaborators: [
          { userId: '', permissions: [SURVEY_PERMISSION.SURVEY_CONF_MANAGE] },
        ],
      };
      const req = { user: { _id: 'userId' } };
      const result = [{ _id: 'collaboratorId' }];

      const response = await controller.batchSaveCollaborator(reqBody, req);

      expect(response).toEqual({
        code: 200,
        data: result,
      });
    });

    it('should throw an exception if validation fails', async () => {
      const reqBody: BatchSaveCollaboratorDto = {
        surveyId: '',
        collaborators: [
          {
            userId: '',
            permissions: [SURVEY_PERMISSION.SURVEY_RESPONSE_MANAGE],
          },
        ],
      };
      const req = { user: { _id: 'userId' } };

      await expect(
        controller.batchSaveCollaborator(reqBody, req),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserSurveyPermissions', () => {
    it('should return user survey permissions successfully', async () => {
      const query = { surveyId: 'surveyId', userId: 'userId' };
      const req = { user: { _id: 'userId' } };
      const result = [
        SURVEY_PERMISSION.SURVEY_CONF_MANAGE,
        SURVEY_PERMISSION.SURVEY_COOPERATION_MANAGE,
      ];

      const response = await controller.getUserSurveyPermissions(query, req);

      expect(response).toEqual({
        code: 200,
        data: result,
      });
    });

    it('should throw an exception if validation fails', async () => {
      const query = { surveyId: '', userId: '' };
      const req = { user: { _id: 'userId' } };

      await expect(
        controller.getUserSurveyPermissions(query, req),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });
});
