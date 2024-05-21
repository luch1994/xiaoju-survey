import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { CollaboratorService } from '../services/collaborator.service';
import { Collaborator } from 'src/models/collaborator.entity';

describe('CollaboratorService', () => {
  let service: CollaboratorService;
  let repository: MongoRepository<Collaborator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaboratorService,
        {
          provide: getRepositoryToken(Collaborator),
          useClass: MongoRepository,
        },
      ],
    }).compile();

    service = module.get<CollaboratorService>(CollaboratorService);
    repository = module.get<MongoRepository<Collaborator>>(
      getRepositoryToken(Collaborator),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new collaborator', async () => {
      const createDto = {
        surveyId: 'surveyId',
        userId: 'userId',
        permissions: ['read'],
      };
      const createdCollaborator = { _id: 'collaboratorId', ...createDto };

      jest
        .spyOn(repository, 'create')
        .mockReturnValue(createdCollaborator as any);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue(createdCollaborator as any);

      const result = await service.create(createDto);

      expect(result).toEqual(createdCollaborator);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createdCollaborator);
    });
  });

  describe('getSurveyCollaboratorList', () => {
    it('should return a list of collaborators for a survey', async () => {
      const surveyId = 'surveyId';
      const collaborators = [
        {
          _id: 'collaboratorId1',
          surveyId,
          userId: 'userId1',
          permissions: ['read'],
        },
        {
          _id: 'collaboratorId2',
          surveyId,
          userId: 'userId2',
          permissions: ['write'],
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(collaborators as any);

      const result = await service.getSurveyCollaboratorList({ surveyId });

      expect(result).toEqual(collaborators);
      expect(repository.find).toHaveBeenCalledWith({ surveyId });
    });
  });

  describe('getUserPermission', () => {
    it('should return user permission for a survey', async () => {
      const surveyId = 'surveyId';
      const userId = 'userId';
      const collaborator = {
        _id: 'collaboratorId',
        surveyId,
        userId,
        permissions: ['read'],
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(collaborator as any);

      const result = await service.getUserPermission({ userId, surveyId });

      expect(result).toEqual(collaborator);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { surveyId, userId },
      });
    });
  });

  describe('changeUserPermission', () => {
    it('should update user permission for a survey', async () => {
      const surveyId = 'surveyId';
      const userId = 'userId';
      const permission = ['write'];
      const updateResult = { matchedCount: 1, modifiedCount: 1 };

      jest
        .spyOn(repository, 'updateOne')
        .mockResolvedValue(updateResult as any);

      const result = await service.changeUserPermission({
        userId,
        surveyId,
        permission,
      });

      expect(result).toEqual(updateResult);
      expect(repository.updateOne).toHaveBeenCalledWith(
        { surveyId, userId },
        { $set: { permission } },
      );
    });
  });

  describe('deleteCollaborator', () => {
    it('should delete a collaborator from a survey', async () => {
      const surveyId = 'surveyId';
      const userId = 'userId';
      const deleteResult = { deletedCount: 1 };

      jest
        .spyOn(repository, 'deleteOne')
        .mockResolvedValue(deleteResult as any);

      const result = await service.deleteCollaborator({ userId, surveyId });

      expect(result).toEqual(deleteResult);
      expect(repository.deleteOne).toHaveBeenCalledWith({ userId, surveyId });
    });
  });
});
