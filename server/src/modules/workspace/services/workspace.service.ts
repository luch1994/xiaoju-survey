import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';

import { Workspace } from 'src/models/workspace.entity';
import { SurveyMeta } from 'src/models/surveyMeta.entity';

import { ObjectId } from 'mongodb';
import { RECORD_STATUS } from 'src/enums';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: MongoRepository<Workspace>,
    @InjectRepository(SurveyMeta)
    private surveyMetaRepository: MongoRepository<SurveyMeta>,
  ) {}

  async create(workspace: {
    name: string;
    description: string;
    ownerId: string;
  }): Promise<Workspace> {
    const newWorkspace = this.workspaceRepository.create({
      ...workspace,
    });
    return this.workspaceRepository.save(newWorkspace);
  }

  async findAllById({
    workspaceIdList,
  }: {
    workspaceIdList: ObjectId[];
  }): Promise<Workspace[]> {
    return this.workspaceRepository.find({
      where: {
        _id: {
          $in: workspaceIdList,
        },
        'curStatus.status': {
          $ne: RECORD_STATUS.REMOVED,
        },
      },
    });
  }

  async update(id: string, workspace: Partial<Workspace>) {
    return await this.workspaceRepository.update(id, workspace);
  }

  async delete(id: string): Promise<void> {
    const newStatus = {
      status: RECORD_STATUS.REMOVED,
      date: Date.now(),
    };
    await this.workspaceRepository.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          curStatus: newStatus,
        },
        $push: {
          statusList: newStatus as never,
        },
      },
    );
    await this.surveyMetaRepository.updateMany(
      {
        workspaceId: id,
      },
      {
        $set: {
          curStatus: newStatus,
        },
        $push: {
          statusList: newStatus as never,
        },
      },
    );
  }
}
