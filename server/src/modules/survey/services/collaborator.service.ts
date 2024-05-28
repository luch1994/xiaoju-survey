import { Injectable } from '@nestjs/common';
import { Collaborator } from 'src/models/collaborator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';

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

  async batchCreate({ surveyId, collaboratorList }) {
    const res = await this.collaboratorRepository.insertMany(
      collaboratorList.map((item) => {
        return {
          ...item,
          surveyId,
        };
      }),
    );
    return res;
  }

  async getSurveyCollaboratorList({ surveyId }) {
    const list = await this.collaboratorRepository.find({
      surveyId,
    });
    return list;
  }

  async getCollaboratorListByIds({ idList }) {
    const list = await this.collaboratorRepository.find({
      _id: {
        $in: idList.map((item) => new ObjectId(item)),
      },
    });
    return list;
  }

  async getCollaborator({ userId, surveyId }) {
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

  async batchDelete({ idList, neIdList, userIdList, surveyId }) {
    const delRes = await this.collaboratorRepository.deleteMany({
      surveyId,
      $or: [
        {
          _id: {
            $in: idList.map((item) => new ObjectId(item)),
            $nin: neIdList.map((item) => new ObjectId(item)),
          },
        },
        {
          userId: {
            $in: userIdList,
          },
        },
      ],
    });
    return delRes;
  }

  async batchDeleteBySurveyId(surveyId) {
    const delRes = await this.collaboratorRepository.deleteMany({
      surveyId,
    });
    return delRes;
  }

  updateById({ collaboratorId, permissions }) {
    return this.collaboratorRepository.updateOne(
      {
        _id: new ObjectId(collaboratorId),
      },
      {
        $set: {
          permissions,
        },
      },
    );
  }

  getCollaboratorListByUserId({ userId }) {
    return this.collaboratorRepository.find({
      where: {
        userId,
      },
    });
  }
}
