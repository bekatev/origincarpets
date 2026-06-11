import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PayPalCaptureOrderDto, PayPalCreateOrderDto } from './dto/paypal-order.dto';
import { StartBankTransferDto } from './dto/start-bank-transfer.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('config')
  getConfig() {
    return this.paymentsService.getPublicConfig();
  }

  @Post('bank-transfer')
  @UseGuards(JwtAuthGuard)
  startBankTransfer(@CurrentUser() user: JwtPayload, @Body() dto: StartBankTransferDto) {
    return this.paymentsService.startBankTransfer(user.sub, dto.orderId);
  }

  @Post('ipay/start')
  @UseGuards(JwtAuthGuard)
  startIpay(@CurrentUser() user: JwtPayload, @Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.startIpayPayment(user.sub, dto.orderId);
  }

  @Get('ipay/callback')
  ipayReturn(@Res() res: Response) {
    return res.redirect(this.paymentsService.ipayReturnRedirect());
  }

  @Post('ipay/callback')
  async ipayWebhook(@Body() body: Record<string, unknown>, @Res() res: Response) {
    await this.paymentsService.handleIpayCallback(body);
    return res.sendStatus(200);
  }

  @Post('paypal/create')
  @UseGuards(JwtAuthGuard)
  createPayPal(@CurrentUser() user: JwtPayload, @Body() dto: PayPalCreateOrderDto) {
    return this.paymentsService.createPayPalOrder(user.sub, dto.orderId);
  }

  @Post('paypal/capture')
  @UseGuards(JwtAuthGuard)
  capturePayPal(@CurrentUser() user: JwtPayload, @Body() dto: PayPalCaptureOrderDto) {
    return this.paymentsService.capturePayPalOrder(user.sub, dto.orderId, dto.paypalOrderId);
  }
}
