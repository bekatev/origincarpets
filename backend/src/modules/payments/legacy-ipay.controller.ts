import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';

/**
 * Legacy iPay routes from the old Origin Carpets API.
 * BOG merchant Callback URL is still registered as /api/transactions/ipay/execute
 * — keep these endpoints so paid orders are marked and admin emails are sent.
 */
@Controller('transactions')
export class LegacyIpayController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('ipay/execute')
  async executeGet(@Query() query: Record<string, unknown>, @Res() res: Response) {
    await this.paymentsService.handleIpayCallback(query);
    return res.redirect(this.paymentsService.ipayReturnRedirect());
  }

  @Post('ipay/execute')
  async executePost(@Body() body: Record<string, unknown>, @Res() res: Response) {
    await this.paymentsService.handleIpayCallback(body);
    return res.sendStatus(200);
  }
}
