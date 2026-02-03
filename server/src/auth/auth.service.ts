
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService, UserRole } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }

    async register(registrationData: any) {
        // Check if user exists
        const existing = await this.usersService.findByMobile(registrationData.mobile);
        if (existing) {
            throw new UnauthorizedException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(registrationData.password, 10);
        const newUser = await this.usersService.create({
            ...registrationData,
            password: hashedPassword,
            role: 'player', // Default role
            isMobileVerified: true,
            isEmailVerified: false
        });
        return this.login(newUser);
    }
}
