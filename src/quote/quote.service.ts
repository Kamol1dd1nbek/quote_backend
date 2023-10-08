import {
  BadRequestException,
  HttpException,
  Injectable,
  HttpStatus,
} from '@nestjs/common';

import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Like, Quote } from '@prisma/client';

@Injectable()
export class QuoteService {
  constructor(private readonly prismaService: PrismaService) {}

  // Create
  async create(createQuoteDto: CreateQuoteDto, userId: number): Promise<Quote> {
    const newQuote = await this.prismaService.quote.create({
      data: {
        ...createQuoteDto,
        author_id: userId,
      },
    });
    if (newQuote) {
      return newQuote;
    } else {
      throw new BadRequestException('Something went wrong');
    }
  }

  // Get All
  async findAll(): Promise<Quote[]> {
    const allQuotes = await this.prismaService.quote.findMany({});
    if (allQuotes.length === 0) {
      throw new HttpException('Quotes not found', HttpStatus.NOT_FOUND);
    } else {
      return allQuotes;
    }
    return allQuotes;
  }

  // Find By Id
  async findOne(id: number): Promise<Quote> {
    const quote = await this.prismaService.quote.findUnique({
      where: {
        id: id,
      },
    });
    if (quote) {
      return quote;
    } else {
      throw new HttpException('Quote not found', HttpStatus.NOT_FOUND);
    }
  }

  // My Quotes
  async myQuotes(userId: number): Promise<Quote[]> {
    const myQuotes = await this.prismaService.quote.findMany({
      where: {
        author: {
          id: userId,
        },
      },
      include: {
        author: true,
      },
    });

    if (!myQuotes.length) {
      throw new HttpException('You have no quotes yet', HttpStatus.NOT_FOUND);
    } else {
      return myQuotes;
    }
  }

  // Update
  async update(
    quoteId: number,
    userId: number,
    isAdmin: boolean,
    updateQuoteDto: UpdateQuoteDto,
  ) {
    const quote = await this.prismaService.quote.findFirst({
      where: {
        id: quoteId,
      },
      include: {
        author: true,
      },
    });
    if (!quote) {
      throw new HttpException('Quote not found', HttpStatus.NOT_FOUND);
    }
    if (quote.author.id === userId || isAdmin) {
      await this.prismaService.quote.update({
        data: {
          ...updateQuoteDto,
        },
        where: {
          id: quote.id,
        },
      });
      throw new HttpException('Successfully updated', HttpStatus.OK);
    } else {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }
  }

  // Delete
  async remove(quoteId: number, userId: number, isAdmin: boolean) {
    const quote = await this.prismaService.quote.findUnique({
      where: {
        id: quoteId,
      },
      include: {
        author: true,
      },
    });
    if (!quote) {
      throw new HttpException('Quote not found', HttpStatus.NOT_FOUND);
    }
    if (isAdmin || quote.author.id === userId) {
      await this.prismaService.quote.delete({
        where: {
          id: quoteId,
        },
      });
      throw new HttpException('Successfully deleted', HttpStatus.OK);
    } else {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }
  }

  // Like or dislike
  async like(userId: number, quoteId: number) {
    let like = null;
    try {
      like = await this.prismaService.like.findFirst({
        where: {
          user_id: userId,
          quote_id: quoteId,
        },
      });
    } catch (error) {
      throw new BadRequestException('User or quote not found');
    }
    if (like) {
      await this.prismaService.like.delete({
        where: {
          id: like.id,
        },
      });
      throw new HttpException('Disliked', HttpStatus.OK);
    } else {
      try {
        await this.prismaService.like.create({
          data: {
            user_id: userId,
            quote_id: quoteId,
          },
        });
      } catch (error) {
        throw new HttpException('Quote not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Liked', HttpStatus.OK);
    }
  }

  //Liked quotes
  async likedQuotos(userId: number): Promise<Like[]> {
    const quotes = await this.prismaService.like.findMany({
      where: {
        user_id: userId,
      },
      include: {
        quote: true,
      },
    });
    if (quotes.length === 0) {
      throw new HttpException('Quotes not found', HttpStatus.NOT_FOUND);
    }
    return quotes;
  }
}
