import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { WorkspaceService } from './services/workspace.service';
import { WorkspaceMemberService } from './services/workspaceMember.service';

import { WorkspaceController } from './controllers/workspace.controller';
import { WorkspaceMemberController } from './controllers/workspaceMember.controller';

import { Workspace } from 'src/models/workspace.entity';
import { WorkspaceMember } from 'src/models/workspaceMember.entity';
import { SurveyMeta } from 'src/models/surveyMeta.entity';

import { AuthModule } from '../auth/auth.module';

import { LoggerProvider } from 'src/logger/logger.provider';
import { WorkspaceGuard } from 'src/guards/workspace.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, WorkspaceMember, SurveyMeta]),
    ConfigModule,
    AuthModule,
  ],
  controllers: [WorkspaceController, WorkspaceMemberController],
  providers: [
    WorkspaceService,
    WorkspaceMemberService,
    LoggerProvider,
    WorkspaceGuard,
  ],
  exports: [WorkspaceMemberService],
})
export class WorkspaceModule {}
