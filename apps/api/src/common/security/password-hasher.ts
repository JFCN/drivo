import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

const SALT_ROUNDS = 10;

@Injectable()
export class PasswordHasher {
  hash(plain: string): Promise<string> {
    return hash(plain, SALT_ROUNDS);
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }
}
