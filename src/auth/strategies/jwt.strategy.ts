import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'votre_secret_jwt_super_secret',
    });
  }

  async validate(payload: { id: string; email: string }) {
    const { id } = payload;

    // Vérifier que l'utilisateur existe toujours
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Retourner l'utilisateur qui sera attaché à req.user
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
