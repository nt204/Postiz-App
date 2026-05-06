import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ioRedis } from '@gitroom/nestjs-libraries/redis/redis.service';

const prisma = new PrismaClient();

@ApiTags('Monitor')
@Controller('/monitor')
export class MonitorController {
  @Get('/queue/:name')
  async getMessagesGroup(@Param('name') name: string) {
    return {
      status: 'success',
      message: `Queue ${name} is healthy.`,
    };
  }

  // Readiness probe: kiểm tra DB và Redis trước khi coi backend là "ready"
  @Get('/health')
  async getHealth(@Res() res: Response) {
    const checks: Record<string, string> = {};
    let healthy = true;

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
      healthy = false;
    }

    try {
      const pong = await ioRedis.ping();
      checks.redis = pong === 'PONG' ? 'ok' : 'error';
      if (checks.redis !== 'ok') healthy = false;
    } catch {
      checks.redis = 'error';
      healthy = false;
    }

    return res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'error', checks });
  }
}
