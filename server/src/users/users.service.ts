
import { Injectable } from '@nestjs/common';
import { CsvService } from '../csv/csv.service';
import { v4 as uuidv4 } from 'uuid';

export type UserRole = 'admin' | 'organizer' | 'scorer' | 'player';

export interface User {
    id: string;
    mobile: string;
    email?: string;
    password?: string;
    fullName: string;
    role: UserRole;
    isMobileVerified: boolean;
    isEmailVerified: boolean;
    verificationBadge?: string;
}

@Injectable()
export class UsersService {
    private readonly filename = 'users.csv';

    constructor(private csvService: CsvService) { }

    async findOne(email: string): Promise<User | undefined> {
        const users = await this.csvService.readUtf8<User>(this.filename);
        return users.find(user => user.email === email);
    }

    async findByMobile(mobile: string): Promise<User | undefined> {
        const users = await this.csvService.readUtf8<User>(this.filename);
        return users.find(user => user.mobile === mobile);
    }

    async findById(id: string): Promise<User | undefined> {
        const users = await this.csvService.readUtf8<User>(this.filename);
        return users.find(user => user.id === id);
    }

    async create(user: Omit<User, 'id'>): Promise<User> {
        const newUser = { ...user, id: uuidv4() };
        await this.csvService.append(this.filename, newUser);
        return newUser;
    }
}
