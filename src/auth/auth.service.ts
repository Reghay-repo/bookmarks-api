import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  signIn() {
    return {
      success: true,
      data: 'this is signin route',
    };
  }

  signUp() {
    return {
      success: true,
      data: 'this is sign up route',
    };
  }
}
