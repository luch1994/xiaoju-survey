import { WorkspaceRole } from 'src/enums/workspaceRolePermission';
export type Member = {
  userId: string;
  role: string;
  _id?: string;
};

export const splitMembers = (members: Array<Member>) => {
  const newMembers = [],
    adminMembers = [],
    userMembers = [];
  for (const member of members) {
    if (!member._id) {
      newMembers.push(member);
    } else if (member.role === WorkspaceRole.ADMIN) {
      adminMembers.push(member._id);
    } else {
      userMembers.push(member._id);
    }
  }
  return {
    newMembers,
    adminMembers,
    userMembers,
  };
};
