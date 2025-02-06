import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from 'nestjs-prisma';
import { PrismaClient } from '@prisma/client';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService, // PrismaService yang di-inject
  ) {}

  @Get()
  @HealthCheck()
  check() {
    // Casting PrismaService ke PrismaClient
    const prismaClient = this.prisma as PrismaClient;

    return this.health.check([
      async () => this.prismaHealth.pingCheck('database', prismaClient), // Menggunakan prismaClient yang sudah di-cast
      () => ({
        http: {
          status: 'up',
          uptime: process.uptime(),
        },
      }),
    ]);
  }
}
