import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  SetMetadata,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { Authentication } from 'src/guards/authentication.guard';
import { WorkspaceGuard } from 'src/guards/workspace.guard';

import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceMemberService } from '../services/workspaceMember.service';

import { CreateWorkspaceDto } from '../dto/createWorkspace.dto';
import { HttpException } from 'src/exceptions/httpException';
import { EXCEPTION_CODE } from 'src/enums/exceptionCode';
import {
  WorkspaceRole,
  WorkspacePermission,
} from 'src/enums/workspaceRolePermission';
import { splitMembers } from '../utils/splitMember';

@ApiTags('workspace')
@ApiBearerAuth()
@UseGuards(Authentication)
@Controller('/api/workspace')
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  @Post()
  async create(@Body() workspace: CreateWorkspaceDto, @Request() req) {
    const { value, error } = CreateWorkspaceDto.validate(workspace);
    if (error) {
      throw new HttpException(
        `参数错误: ${error.message}`,
        EXCEPTION_CODE.PARAMETER_ERROR,
      );
    }
    const userId = req.user._id.toString();
    // 插入空间表
    const retWorkspace = await this.workspaceService.create({
      name: value.name,
      description: value.description,
      ownerId: userId,
    });
    const workspaceId = retWorkspace._id.toString();
    // 空间的成员表要新增一条管理员数据
    await this.workspaceMemberService.create({
      userId,
      workspaceId,
      role: WorkspaceRole.ADMIN,
    });
    if (Array.isArray(value.members) && value.members.length > 0) {
      await this.workspaceMemberService.batchCreate({
        workspaceId,
        members: value.members,
      });
    }
    return {
      code: 200,
      data: {
        workspaceId,
      },
    };
  }

  @Get()
  async findAll(@Request() req) {
    const userId = req.user._id.toString();
    // 查询当前用户参与的空间
    const workspaceInfoList = await this.workspaceMemberService.findAllByUserId(
      { userId },
    );
    const workspaceIdList = workspaceInfoList.map(
      (item) => new ObjectId(item.workspaceId),
    );
    // 查询当前用户的空间列表
    const list = await this.workspaceService.findAllById({ workspaceIdList });
    return {
      code: 200,
      data: list,
    };
  }

  @Get(':id')
  @UseGuards(WorkspaceGuard)
  @SetMetadata('workspacePermissions', [WorkspacePermission.GET_WORKSPACE])
  @SetMetadata('workspaceId', 'params.id')
  async getWorkspaceInfo(@Param('id') workspaceId: string) {
    const workspaceInfo = await this.workspaceService.findOneById(workspaceId);
    const members = await this.workspaceMemberService.findAllByWorkspaceId({
      workspaceId,
    });
    return {
      code: 200,
      data: {
        _id: workspaceInfo._id,
        name: workspaceInfo.name,
        description: workspaceInfo.description,
        members,
      },
    };
  }

  @Post(':id')
  @UseGuards(WorkspaceGuard)
  @SetMetadata('workspacePermissions', [WorkspacePermission.UPDATE_WORKSPACE])
  @SetMetadata('workspaceId', 'params.id')
  async update(@Param('id') id: string, @Body() workspace: CreateWorkspaceDto) {
    const members = workspace.members;
    delete workspace.members;
    const updateRes = await this.workspaceService.update(id, workspace);
    const { newMembers, adminMembers, userMembers } = splitMembers(members);
    const allIds = [...adminMembers, ...userMembers];
    // 新增和更新成员,把数据库里已删除的成员删掉
    await Promise.all([
      this.workspaceMemberService.batchDelete({ idList: allIds }),
      this.workspaceMemberService.batchCreate({
        workspaceId: id,
        members: newMembers,
      }),
      this.workspaceMemberService.batchUpdate({
        idList: adminMembers,
        role: WorkspaceRole.ADMIN,
      }),
      this.workspaceMemberService.batchUpdate({
        idList: userMembers,
        role: WorkspaceRole.USER,
      }),
    ]);
    return {
      code: 200,
      data: {
        affected: updateRes.affected,
      },
    };
  }

  @Delete(':id')
  @UseGuards(WorkspaceGuard)
  @SetMetadata('workspacePermissions', [WorkspacePermission.DELETE_WORKSPACE])
  @SetMetadata('workspaceId', 'params.id')
  async delete(@Param('id') id: string) {
    await this.workspaceService.delete(id);
    return {
      code: 200,
    };
  }
}
