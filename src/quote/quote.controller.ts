import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Quote } from '@prisma/client';
import { getCurrentUser } from '../common/decorators/getCurrentUser.decorator';
import { JwtPayload } from '../auth/types';

@ApiTags('Quote')
@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  // Create quote
  @ApiOperation({ summary: '| Create quote' })
  @Post()
  create(
    @Body() createQuoteDto: CreateQuoteDto,
    @getCurrentUser() currentUser: JwtPayload,
  ) {
    return this.quoteService.create(createQuoteDto, currentUser.id);
  }

  // Get all quotes
  @ApiOperation({ summary: '| Get all quotes' })
  @Get()
  findAll() {
    return this.quoteService.findAll();
  }

  // My quotes
  @ApiOperation({ summary: '| My quotes' })
  @Get('my')
  myQuotes(@getCurrentUser() currentUser: any) {
    return this.quoteService.myQuotes(currentUser.id);
  }

  // Liked quotos
  @ApiOperation({ summary: '| Liked quotes' })
  @Get('liked')
  liked(@getCurrentUser() currentUser: JwtPayload) {
    return this.quoteService.likedQuotos(currentUser.id);
  }

  // GEt by Id
  @ApiOperation({ summary: '| Get quote by id' })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Quote> {
    return this.quoteService.findOne(+id);
  }

  // Quote update
  @ApiOperation({ summary: '| Quote update' })
  @Put(':id')
  update(
    @Param('id') quoteId: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
    @getCurrentUser() currentUser: JwtPayload,
  ) {
    return this.quoteService.update(
      +quoteId,
      currentUser.id,
      currentUser.is_admin,
      updateQuoteDto,
    );
  }

  // Quote delete
  @ApiOperation({ summary: '| Quote delete' })
  @Delete(':id')
  remove(@Param('id') id: string, @getCurrentUser() currentUser: JwtPayload) {
    return this.quoteService.remove(+id, currentUser.id, currentUser.is_admin);
  }

  // Like or dislike
  @ApiOperation({ summary: '| Like or dislike' })
  @Post('like/:quoteId')
  likeOrDislike(
    @Param('quoteId') quoteId: string,
    @getCurrentUser() currentUser: JwtPayload,
  ) {
    return this.quoteService.like(currentUser.id, +quoteId);
  }
}
