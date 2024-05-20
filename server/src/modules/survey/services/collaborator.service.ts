import { Injectable } from '@nestjs/common';
import { Collaborator } from 'src/models/collaborator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';

@Injectable()
export class CollaboratorService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: MongoRepository<Collaborator>,
  ) {}

  async create({ surveyId, userId, permissions }) {
    const collaborator = this.collaboratorRepository.create({
      surveyId,
      userId,
      permissions,
    });
    return this.collaboratorRepository.save(collaborator);
  }

  async getSurveyCollaboratorList({ surveyId }) {
    const list = await this.collaboratorRepository.find({
      surveyId,
    });
    return list;
  }

  async getUserPermission({ userId, surveyId }) {
    const info = await this.collaboratorRepository.findOne({
      where: {
        surveyId,
        userId,
      },
    });
    return info;
  }

  async changeUserPermission({ userId, surveyId, permission }) {
    const updateRes = await this.collaboratorRepository.updateOne(
      {
        surveyId,
        userId,
      },
      {
        $set: {
          permission,
        },
      },
    );
    return updateRes;
  }

  async deleteCollaborator({ userId, surveyId }) {
    const delRes = await this.collaboratorRepository.deleteOne({
      userId,
      surveyId,
    });
    return delRes;
  }
}
