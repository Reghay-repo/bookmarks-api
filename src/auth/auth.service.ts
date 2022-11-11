import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, LoginDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async register(dto: AuthDto) {
    try {
      // hash the user password
      const hash = await argon.hash(dto.password);

      // save the new user in db

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      const token = await this.signToken(user.id, user.email);

      const response = {
        success: true,
        data: token,
      };
      return response;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
        throw error;
      }
    }
  }

  async login(dto: LoginDto) {
    // find user by email
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    // if user not found throw an exeption
    if (!user) throw new ForbiddenException('Invalid Credentials');
    // compare password
    const matchPassword = await argon.verify(user.hash, dto.password);

    // if password incorect we throw exception
    if (!matchPassword) throw new ForbiddenException('Invalid Credentials');

    // if password match we return token

    const token = await this.signToken(user.id, user.email);

    const response = {
      success: true,
      data: token,
    };
    return response;
  }
  signToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    const token = this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: this.config.get('JWT_SECRET'),
    });
    return token;
  }
}
