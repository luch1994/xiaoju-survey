import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { get } from 'lodash';

import { AuthenticationException } from '../exceptions/authException';

import { WorkspaceMemberService } from 'src/modules/workspace/services/workspaceMember.service';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>(
      'workspaceRoles',
      context.getHandler(),
    );

    if (!roles) {
      return true; // 没有定义角色，允许访问
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceIdInfo = this.reflector.get(
      'workspaceId',
      context.getHandler(),
    );

    let workspaceIdKey, optional;
    if (typeof workspaceIdInfo === 'string') {
      workspaceIdKey = workspaceIdInfo;
      optional = false;
    } else {
      workspaceIdKey = workspaceIdInfo?.key;
      optional = workspaceIdInfo?.optional || false;
    }

    const workspaceId = get(request, workspaceIdKey);

    if (!workspaceId && optional === false) {
      throw new AuthenticationException('没有空间权限');
    }

    if (workspaceId) {
      const membersInfo = await this.workspaceMemberService.findOne({
        workspaceId,
        userId: user._id.toString(),
      });

      if (!membersInfo) {
        throw new AuthenticationException('没有空间权限');
      }
      if (!roles.includes(membersInfo.role)) {
        throw new AuthenticationException('没有空间权限');
      }
    }

    return true;
  }
}
