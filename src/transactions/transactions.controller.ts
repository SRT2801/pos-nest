import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { IdValidationPipe } from '../common/pipes/id-validation/id-validation.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.transactionsService.create(createTransactionDto, userId);
  }

  @Get()
  findAll(
    @Query('transactionDate') transactionDate: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.transactionsService.findAll(transactionDate, user);
  }

  @Get(':id')
  findOne(
    @Param('id', IdValidationPipe) id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.transactionsService.findOne(+id, user);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', IdValidationPipe) id: string) {
    return this.transactionsService.remove(+id);
  }
}
