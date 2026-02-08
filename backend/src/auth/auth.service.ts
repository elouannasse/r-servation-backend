import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      name,
    });

    await newUser.save();

    return {
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Trouver l'utilisateur par email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Générer le JWT token
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(
    userId: string,
    updateData: {
      name: string;
      email: string;
      currentPassword?: string;
      newPassword?: string;
    },
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Vérifier si l'email est déjà pris par un autre utilisateur
    if (updateData.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        email: updateData.email,
      });
      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    // Mettre à jour nom et email
    user.name = updateData.name;
    user.email = updateData.email;

    // Changer le mot de passe si demandé
    if (updateData.currentPassword && updateData.newPassword) {
      const isPasswordValid = await bcrypt.compare(
        updateData.currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Mot de passe actuel incorrect');
      }
      user.password = await bcrypt.hash(updateData.newPassword, 10);
    }

    await user.save();

    return {
      message: 'Profil mis à jour avec succès',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
