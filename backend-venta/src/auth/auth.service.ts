import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../config/logger.config';

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME_MINUTES = 30;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      fullName: registerDto.fullName,
      role: registerDto.role,
      isActive: true,
    });

    await this.userRepository.save(user);

    const { password, ...result } = user;

    this.logger.info('User registered', { userId: user.id, email: user.email });

    return {
      message: 'User registered successfully',
      user: result,
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      this.logger.loginFailed(loginDto.email, ipAddress || 'unknown', 'User not found');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      this.logger.loginFailed(loginDto.email, ipAddress || 'unknown', 'Account inactive');
      throw new UnauthorizedException('Account is inactive');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - new Date().getTime()) / 60000,
      );
      this.logger.loginFailed(loginDto.email, ipAddress || 'unknown', 'Account locked');
      throw new UnauthorizedException(
        `Account is locked. Try again in ${remainingMinutes} minutes`,
      );
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      this.logger.loginFailed(loginDto.email, ipAddress || 'unknown', 'Invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.handleSuccessfulLogin(user);
    this.logger.loginSuccess(user.id, user.email, ipAddress || 'unknown');

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    
    const refreshToken = await this.generateRefreshToken(user, ipAddress, userAgent);

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
      expires_in: 900,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // 🔐 GENERAR REFRESH TOKEN (AHORA HASHEADO)
  private async generateRefreshToken(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshToken> {
    const rawToken = uuidv4();
    const hashedToken = await bcrypt.hash(rawToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = this.refreshTokenRepository.create({
      userId: user.id,
      token: hashedToken,
      expiresAt,
      ipAddress,
      userAgent,
      isRevoked: false,
    });

    await this.refreshTokenRepository.save(refreshToken);

    // devolvemos el token real (no el hash)
    return { ...refreshToken, token: rawToken } as RefreshToken;
  }

  // 🔄 REFRESH TOKEN ROTATION + REUSE DETECTION
  async refreshAccessToken(refreshToken: string): Promise<any> {
    const storedTokens = await this.refreshTokenRepository.find({
      where: { isRevoked: false },
      relations: ['user'],
    });

    let storedToken: RefreshToken | undefined;

    for (const token of storedTokens) {
      const match = await bcrypt.compare(refreshToken, token.token);
      if (match) {
        storedToken = token;
        break;
      }
    }

    if (!storedToken) {
      // 🔥 Posible reuse attack
      const allTokens = await this.refreshTokenRepository.find({
        relations: ['user'],
      });

      for (const token of allTokens) {
        const match = await bcrypt.compare(refreshToken, token.token);
        if (match) {
          await this.refreshTokenRepository.update(
            { userId: token.userId },
            { isRevoked: true },
          );

          this.logger.security('REFRESH_TOKEN_REUSE_DETECTED', {
            userId: token.userId,
          });

          break;
        }
      }

      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.update(
        { id: storedToken.id },
        { isRevoked: true },
      );
      throw new UnauthorizedException('Refresh token expired');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    // 🔄 ROTACIÓN
    await this.refreshTokenRepository.update(
      { id: storedToken.id },
      { isRevoked: true },
    );

    const newRefreshToken = await this.generateRefreshToken(
      storedToken.user,
      storedToken.ipAddress,
      storedToken.userAgent,
    );

    const payload = {
      email: storedToken.user.email,
      sub: storedToken.user.id,
      role: storedToken.user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: newRefreshToken.token,
      expires_in: 900,
    };
  }

  // 🔐 REVOKE TOKEN (AHORA FUNCIONA CON HASH)
  async revokeRefreshToken(token: string): Promise<void> {
    const tokens = await this.refreshTokenRepository.find({
      where: { isRevoked: false },
    });

    for (const storedToken of tokens) {
      const match = await bcrypt.compare(token, storedToken.token);
      if (match) {
        await this.refreshTokenRepository.update(
          { id: storedToken.id },
          { isRevoked: true },
        );
        break;
      }
    }

    this.logger.info('Refresh token revoked');
  }

  private async handleFailedLogin(user: User) {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + this.LOCK_TIME_MINUTES * 60000);
      user.failedLoginAttempts = 0;

      this.logger.security('ACCOUNT_LOCKED', {
        userId: user.id,
        email: user.email,
        attempts: this.MAX_LOGIN_ATTEMPTS,
        lockedUntil: user.lockedUntil,
      });
    }

    await this.userRepository.save(user);
  }

  private async handleSuccessfulLogin(user: User) {
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLogin = new Date();
    await this.userRepository.save(user);
  }
}
