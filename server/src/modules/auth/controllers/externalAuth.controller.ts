import {
  Controller,
  Param,
  Get,
  Post,
  Query,
  Body,
  Req,
  Res,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExternalAuthService } from '../services/externalAuth.service';
import { EXTERNAL_LOGIN_KIND_ENUM } from 'src/enums/externalAuth';
import { HttpException } from 'src/exceptions/httpException';
import { EXCEPTION_CODE } from 'src/enums/exceptionCode';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { generateUrl } from '../utils';
import { Logger } from 'src/logger';
import { BindAccountDto } from '../dto/external.dto';

@ApiTags('externalAuth')
@Controller('/api/externalAuth')
export class ExternalAuthController {
  constructor(
    private readonly externalAuthService: ExternalAuthService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  @Get('/authUrl/:kind')
  async getAuth(
    @Param('kind') kind: EXTERNAL_LOGIN_KIND_ENUM,
    @Query() query: Record<string, string>,
    @Res() res: any,
  ) {
    if (!query.state) {
      return {
        code: 500,
        message: '参数有误',
      };
    }
    const authUrl = await this.externalAuthService.generateAuthUrl({
      kind,
      state: query.state,
    });
    res.redirect(302, authUrl);
  }

  @HttpCode(200)
  @Post('/authUrl/:kind')
  async postAuth(
    @Param('kind') kind: EXTERNAL_LOGIN_KIND_ENUM,
    @Query() query: Record<string, string>,
  ) {
    if (!query.state) {
      return {
        code: 500,
        message: '参数有误',
      };
    }
    const authUrl = await this.externalAuthService.generateAuthUrl({
      kind,
      state: query.state,
    });
    return {
      code: 200,
      data: {
        authUrl,
      },
    };
  }

  @HttpCode(200)
  @Get('/:kind/callback')
  async authGetCallback(
    @Param('kind') kind: EXTERNAL_LOGIN_KIND_ENUM,
    @Query() query: Record<string, string>,
    @Req() req: any,
    @Res() res: any,
  ) {
    await this.handleCallback({ kind, query, req, res });
  }

  @HttpCode(200)
  @Post('/:kind/callback')
  async authPostCallback(
    @Param('kind') kind: EXTERNAL_LOGIN_KIND_ENUM,
    @Query() query: Record<string, string>,
    @Req() req: any,
    @Res() res: any,
  ) {
    await this.handleCallback({ kind, query, req, res });
  }

  private async handleCallback({
    kind,
    query,
    res,
  }: {
    kind: EXTERNAL_LOGIN_KIND_ENUM;
    query: Record<string, string>;
    req: any;
    res: any;
  }) {
    try {
      let clientId;
      let remoteUser;
      switch (kind) {
        case EXTERNAL_LOGIN_KIND_ENUM.GOOGLE: {
          if (!query.code) {
            throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
          }
          const ticket = await this.externalAuthService.getTicketByCode({
            kind,
            code: query.code,
          });
          const googleUser = await this.externalAuthService.getUserInfoByTicket(
            {
              kind,
              ticket,
            },
          );

          remoteUser = {
            openid: googleUser.openid,
            username: googleUser.user.email.split('@')[0],
            email: googleUser.user.email,
            avatar: googleUser.user.avatar,
            name: googleUser.user.name,
          };

          clientId = this.configService.get<string>(
            'XIAOJU_SURVEY_GOOGLE_CLIENT_ID',
          );
          break;
        }
        default:
          throw new HttpException('系统错误', EXCEPTION_CODE.SYSTEM_ERROR);
      }
      if (!remoteUser) {
        throw new HttpException(
          '系统异常',
          EXCEPTION_CODE.AUTHENTICATION_FAILED,
        );
      }
      // 如果是使用绑定功能的话，走绑定用户的逻辑
      this.bindUser({ kind, remoteUser, clientId, res });
      // 如果不需要绑定用户，直接替换登录方式的话，走对比用户新增用户的逻辑
      // this.handleLogin({ remoteUser, res });
    } catch (err) {
      this.logger.error(err, {});
      throw new HttpException(err.message, EXCEPTION_CODE.SYSTEM_ERROR);
    }
  }

  @HttpCode(200)
  @Post('/bindAccount')
  async bindAccount(@Body() reqBody: BindAccountDto) {
    const { value, error } = BindAccountDto.validate(reqBody);
    if (error) {
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }
    const externalUser = await this.userService.getExternalUserById(value.eid);
    if (!externalUser) {
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }
    let user,
      alreadyBound = false;
    if (externalUser.userId) {
      user = await this.userService.getUserById(externalUser.userId);
      alreadyBound = true;
    } else {
      user = await this.userService.getUser({
        username: value.username,
        password: value.password,
      });
    }

    if (!user) {
      throw new HttpException('账号或密码有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }
    if (!alreadyBound) {
      const bindRes = await this.userService.bindUser({
        externalUserId: value.eid,
        userId: user._id.toString(),
      });
      this.logger.info(`'bindRes: ${JSON.stringify(bindRes)}`);
    }

    let token;
    try {
      token = await this.authService.generateToken({
        username: user.username,
        _id: user._id.toString(),
      });
      // 验证过的验证码要删掉，防止被别人保存重复调用
    } catch (error) {
      throw new Error('generateToken erro:' + error.message);
    }

    return {
      code: 200,
      data: {
        token,
        username: user.username,
        alreadyBound,
      },
    };
  }

  @HttpCode(200)
  @Post('/register')
  async register(@Body() reqBody: BindAccountDto) {
    const { value, error } = BindAccountDto.validate(reqBody);
    if (error) {
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }
    const externalUser = await this.userService.getExternalUserById(value.eid);
    if (!externalUser || externalUser.userId) {
      throw new HttpException('参数有误', EXCEPTION_CODE.PARAMETER_ERROR);
    }
    const user = await this.userService.createUser({
      username: value.username,
      password: value.password,
    });
    await this.userService.bindUser({
      externalUserId: value.eid,
      userId: user._id.toString,
    });
    let token;
    try {
      token = await this.authService.generateToken({
        username: user.username,
        _id: user._id.toString(),
      });
      // 验证过的验证码要删掉，防止被别人保存重复调用
    } catch (error) {
      throw new Error('generateToken erro:' + error.message);
    }

    return {
      code: 200,
      data: {
        token,
        username: user.username,
      },
    };
  }

  private async bindUser({
    kind,
    remoteUser,
    clientId,
    res,
  }: {
    kind: string;
    remoteUser: Record<string, any>;
    clientId: string;
    res: any;
  }) {
    let existsExternalUser = await this.userService.getExternalUserByOpenId({
      kind,
      openid: remoteUser.openid,
      clientId,
    });
    if (!existsExternalUser) {
      // 新账号，插入externalUser表
      existsExternalUser = await this.userService.createExternalUser({
        kind,
        clientId,
        ...remoteUser,
      });
    }
    if (!existsExternalUser.userId) {
      // 新的账号，没有绑定过任何用户，跳转前端，让其选择绑定已有账号还是注册新账号
      const username = remoteUser.username;
      const redirectUrl = generateUrl('/management/auth/bind', {
        eid: existsExternalUser._id.toString(),
        username,
      });
      res.redirect(302, redirectUrl);
    } else {
      const existingUser = await this.userService.getUserById(
        existsExternalUser.userId,
      );
      const jwt = await this.authService.generateToken({
        _id: existingUser._id.toString(),
        username: existingUser.username,
      });
      const redirectUrl = generateUrl('/management/auth/callback', {
        token: jwt,
        username: existingUser.username,
      });
      res.redirect(302, redirectUrl);
    }
  }

  private async handleLogin({
    remoteUser,
    res,
  }: {
    remoteUser: Record<string, any>;
    res: any;
  }) {
    let userInfo = await this.userService.getUserByOpenid(remoteUser.openid);
    if (!userInfo) {
      // 新用户，入库
      userInfo = await this.userService.createUserByOpenid({
        username: remoteUser.username,
        email: remoteUser.email,
        openid: remoteUser.openid,
        avatar: remoteUser.avatar,
        name: remoteUser.name,
      });
    } else {
      // 已有用户，更新信息
      if (remoteUser.email) {
        userInfo.email = remoteUser.email;
      }
      if (remoteUser.avatar) {
        userInfo.avatar = remoteUser.avatar;
      }
      if (remoteUser.name) {
        userInfo.name = remoteUser.name;
      }
      await this.userService.saveUser(userInfo);
    }
    const jwt = await this.authService.generateToken({
      _id: userInfo._id.toString(),
      username: userInfo.username,
    });
    const redirectUrl = generateUrl('/management/auth/callback', {
      token: jwt,
      username: userInfo.username,
    });
    res.redirect(302, redirectUrl);
  }
}
