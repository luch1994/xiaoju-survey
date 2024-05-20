import { ApiProperty } from '@nestjs/swagger';
import Joi from 'joi';
import { WorkspaceRole } from 'src/enums/workspaceRolePermission';

export class CreateWorkspaceDto {
  @ApiProperty({ description: '空间名称', required: true })
  name: string;

  @ApiProperty({ description: '空间描述', required: false })
  description?: string;

  @ApiProperty({ description: '空间成员', required: true })
  members: Array<{ userId: string; role: WorkspaceRole }>;

  static validate(data) {
    return Joi.object({
      name: Joi.string().required(),
      description: Joi.string().allow(null),
      members: Joi.array()
        .allow(null)
        .items(
          Joi.object({
            userId: Joi.string().required(),
            role: Joi.string().valid(WorkspaceRole.ADMIN, WorkspaceRole.USER),
          }),
        ),
    }).validate(data);
  }
}
