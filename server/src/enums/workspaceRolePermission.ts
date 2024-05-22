export enum WorkspaceRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum WorkspacePermission {
  GET_WORKSPACE = 'getWorkspace',
  UPDATE_WORKSPACE = 'updateWorkspace',
  DELETE_WORKSPACE = 'deleteWorkspace',
  ADD_MEMBERS = 'addMembers',
  UPDATE_MEMBER_ROLE = 'updateMemberRole',
  DELETE_MEMBER = 'deleteMember',
  MANAGE_SURVEY = 'manageSurvey',
}

export const WorkspaceRolePermissionsMap: Record<
  WorkspaceRole,
  WorkspacePermission[]
> = {
  [WorkspaceRole.ADMIN]: [
    WorkspacePermission.UPDATE_WORKSPACE,
    WorkspacePermission.DELETE_WORKSPACE,
    WorkspacePermission.ADD_MEMBERS,
    WorkspacePermission.UPDATE_MEMBER_ROLE,
    WorkspacePermission.DELETE_MEMBER,
    WorkspacePermission.MANAGE_SURVEY,
  ],
  [WorkspaceRole.USER]: [WorkspacePermission.MANAGE_SURVEY],
};
