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

jest.mock('src/guards/authentication.guard');
jest.mock('src/guards/survey.guard');
jest.mock('src/guards/workspace.guard');

describe('CollaboratorController', () => {
  let controller: CollaboratorController;
  let collaboratorService: CollaboratorService;
  let logger: Logger;

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
          },
        },
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
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
          },
        },
      ],
    }).compile();

    controller = module.get<CollaboratorController>(CollaboratorController);
    collaboratorService = module.get<CollaboratorService>(CollaboratorService);
    logger = module.get<Logger>(Logger);
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
        permissions: [1001],
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
        permissions: [1001],
      };
      const req = { user: { _id: 'userId' } };

      await expect(controller.addCollaborator(reqBody, req)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getSurveyCollaboratorList', () => {
    it('should return collaborator list', async () => {
      const query = { surveyId: 'surveyId' };
      const req = { user: { _id: 'userId' } };
      const result = [{ _id: 'collaboratorId', userId: 'userId' }];

      jest
        .spyOn(collaboratorService, 'getSurveyCollaboratorList')
        .mockResolvedValue(result as unknown as Array<Collaborator>);

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
});
