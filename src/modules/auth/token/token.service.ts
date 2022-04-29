import { Injectable } from '@nestjs/common';
import { PickType } from '@nestjs/mapped-types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from 'src/models/token.entity';

class TokenBody extends PickType(Token, ['userId', 'token', 'expired_at'] as const) { };

@Injectable()
export class TokenService {
    constructor(@InjectRepository(Token) private readonly tokenRepository: Repository<Token>) { };

    saveToken(body: TokenBody) {
        const newToken = this.tokenRepository.create(body);
        return this.tokenRepository.save(newToken);
    }

    updateToken(options: Partial<Token>, body: Partial<TokenBody>) {
        return this.tokenRepository.update(options, body);
    }

    findOne(options: Record<string, string | Date>) {
        return this.tokenRepository.findOne(options);
    }

    removeToken(options: Partial<Token>) {
        return this.tokenRepository.delete(options);
    }
};
