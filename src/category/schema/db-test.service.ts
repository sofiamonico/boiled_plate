import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DBTestService {
  constructor(@InjectConnection() private connection: Connection) {}

  clearDB() {
    return this.connection.db.dropDatabase();
  }
}
