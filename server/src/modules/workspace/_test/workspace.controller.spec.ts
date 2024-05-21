import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceController } from '../controllers/workspace.controller';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceMemberService } from '../services/workspaceMember.service';
import { CreateWorkspaceDto } from '../dto/createWorkspace.dto';
import { HttpException } from 'src/exceptions/httpException';
import { WorkspaceRole } from 'src/enums/workspaceRolePermission';
import { ObjectId } from 'mongodb';
import { Workspace } from 'src/models/workspace.entity';
import { WorkspaceMember } from 'src/models/workspaceMember.entity';

jest.mock('src/guards/authentication.guard');
jest.mock('src/guards/survey.guard');
jest.mock('src/guards/workspace.guard');

describe('WorkspaceController', () => {
  let controller: WorkspaceController;
  let workspaceService: WorkspaceService;
  let workspaceMemberService: WorkspaceMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [
        {
          provide: WorkspaceService,
          useValue: {
            create: jest.fn(),
            findAllById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: WorkspaceMemberService,
          useValue: {
            create: jest.fn(),
            batchCreate: jest.fn(),
            findAllByUserId: jest.fn(),
            batchUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WorkspaceController>(WorkspaceController);
    workspaceService = module.get<WorkspaceService>(WorkspaceService);
    workspaceMemberService = module.get<WorkspaceMemberService>(
      WorkspaceMemberService,
    );
  });

  describe('create', () => {
    it('should create a workspace and return workspaceId', async () => {
      const createWorkspaceDto: CreateWorkspaceDto = {
        name: 'Test Workspace',
        description: 'Test Description',
        members: [{ userId: 'userId1', role: WorkspaceRole.USER }],
      };
      const req = { user: { _id: new ObjectId() } };
      const createdWorkspace = { _id: new ObjectId() };

      jest
        .spyOn(workspaceService, 'create')
        .mockResolvedValue(createdWorkspace as Workspace);
      jest.spyOn(workspaceMemberService, 'create').mockResolvedValue(null);
      jest.spyOn(workspaceMemberService, 'batchCreate').mockResolvedValue(null);

      const result = await controller.create(createWorkspaceDto, req);

      expect(result).toEqual({
        code: 200,
        data: { workspaceId: createdWorkspace._id.toString() },
      });
      expect(workspaceService.create).toHaveBeenCalledWith({
        name: createWorkspaceDto.name,
        description: createWorkspaceDto.description,
        ownerId: req.user._id.toString(),
      });
      expect(workspaceMemberService.create).toHaveBeenCalledWith({
        userId: req.user._id.toString(),
        workspaceId: createdWorkspace._id.toString(),
        role: WorkspaceRole.ADMIN,
      });
      expect(workspaceMemberService.batchCreate).toHaveBeenCalledWith({
        workspaceId: createdWorkspace._id.toString(),
        members: createWorkspaceDto.members,
      });
    });

    it('should throw an exception if validation fails', async () => {
      const createWorkspaceDto: CreateWorkspaceDto = {
        name: '',
        members: [],
      };
      const req = { user: { _id: new ObjectId() } };

      await expect(controller.create(createWorkspaceDto, req)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of workspaces for the user', async () => {
      const req = { user: { _id: new ObjectId() } };
      const workspaceInfoList = [{ workspaceId: new ObjectId().toString() }];
      const workspaces = [{ _id: new ObjectId(), name: 'Test Workspace' }];

      jest
        .spyOn(workspaceMemberService, 'findAllByUserId')
        .mockResolvedValue(
          workspaceInfoList as unknown as Array<WorkspaceMember>,
        );
      jest
        .spyOn(workspaceService, 'findAllById')
        .mockResolvedValue(workspaces as Array<Workspace>);

      const result = await controller.findAll(req);

      expect(result).toEqual({ code: 200, data: workspaces });
      expect(workspaceMemberService.findAllByUserId).toHaveBeenCalledWith({
        userId: req.user._id.toString(),
      });
      expect(workspaceService.findAllById).toHaveBeenCalledWith({
        workspaceIdList: workspaceInfoList.map(
          (item) => new ObjectId(item.workspaceId),
        ),
      });
    });
  });

  describe('update', () => {
    it('should update a workspace and its members', async () => {
      const id = 'workspaceId';
      const updateDto = { name: 'Updated Workspace', members: [] };
      const updateResult = { affected: 1, raw: '', generatedMaps: [] };
      const members = { newMembers: [], adminMembers: [], userMembers: [] };

      jest.spyOn(workspaceService, 'update').mockResolvedValue(updateResult);
      jest.spyOn(workspaceMemberService, 'batchCreate').mockResolvedValue(null);
      jest.spyOn(workspaceMemberService, 'batchUpdate').mockResolvedValue(null);

      const result = await controller.update(id, updateDto);

      expect(result).toEqual({
        code: 200,
        data: { affected: updateResult.affected },
      });
      expect(workspaceService.update).toHaveBeenCalledWith(id, {
        name: updateDto.name,
      });
      expect(workspaceMemberService.batchCreate).toHaveBeenCalledWith({
        workspaceId: id,
        members: members.newMembers,
      });
      expect(workspaceMemberService.batchUpdate).toHaveBeenCalledWith({
        idList: members.adminMembers,
        role: WorkspaceRole.ADMIN,
      });
      expect(workspaceMemberService.batchUpdate).toHaveBeenCalledWith({
        idList: members.userMembers,
        role: WorkspaceRole.USER,
      });
    });
  });

  describe('delete', () => {
    it('should delete a workspace', async () => {
      const id = 'workspaceId';

      jest.spyOn(workspaceService, 'delete').mockResolvedValue(null);

      const result = await controller.delete(id);

      expect(result).toEqual({ code: 200 });
      expect(workspaceService.delete).toHaveBeenCalledWith(id);
    });
  });
});
