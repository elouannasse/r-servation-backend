import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: UserPayload) {
    return this.authService.getMe(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @CurrentUser() user: UserPayload,
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, updateProfileDto);
  }
}
