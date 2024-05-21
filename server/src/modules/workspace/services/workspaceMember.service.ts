import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { WorkspaceMember } from 'src/models/workspaceMember.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class WorkspaceMemberService {
  constructor(
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepository: MongoRepository<WorkspaceMember>,
  ) {}

  async create(member: {
    role: string;
    userId: string;
    workspaceId: string;
  }): Promise<WorkspaceMember> {
    const newMember = this.workspaceMemberRepository.create(member);
    return this.workspaceMemberRepository.save(newMember);
  }

  async batchCreate({
    workspaceId,
    members,
  }: {
    workspaceId: string;
    members: Array<{ userId: string; role: string }>;
  }) {
    if (members.length === 0) {
      return {
        insertedCount: 0,
      };
    }
    const dataToInsert = members.map((item) => {
      return {
        ...item,
        workspaceId,
      };
    });
    return this.workspaceMemberRepository.insertMany(dataToInsert);
  }

  async batchUpdate({ idList, role }: { idList: Array<string>; role: string }) {
    if (idList.length === 0) {
      return {
        modifiedCount: 0,
      };
    }
    return this.workspaceMemberRepository.updateMany(
      {
        _id: {
          $in: idList.map((item) => new ObjectId(item)),
        },
      },
      {
        $set: {
          role,
        },
      },
    );
  }

  async batchDelete({ idList }: { idList: Array<string> }) {
    if (idList.length === 0) {
      return {
        modifiedCount: 0,
      };
    }
    return this.workspaceMemberRepository.deleteMany({
      _id: {
        $in: idList.map((item) => new ObjectId(item)),
      },
    });
  }

  async findAllByUserId({ userId }): Promise<WorkspaceMember[]> {
    return this.workspaceMemberRepository.find({
      where: {
        userId,
      },
    });
  }

  async findAllByWorkspaceId({ workspaceId }): Promise<WorkspaceMember[]> {
    return this.workspaceMemberRepository.find({
      where: {
        workspaceId,
      },
    });
  }

  async findOne({ workspaceId, userId }): Promise<WorkspaceMember> {
    return this.workspaceMemberRepository.findOne({
      where: {
        workspaceId,
        userId,
      },
    });
  }

  async updateRole({ workspaceId, userId, role }) {
    return this.workspaceMemberRepository.updateOne(
      {
        workspaceId,
        userId,
      },
      {
        $set: {
          role,
        },
      },
    );
  }

  async deleteMember({ workspaceId, userId }) {
    return this.workspaceMemberRepository.deleteOne({
      workspaceId,
      userId,
    });
  }
}
