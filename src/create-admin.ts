import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { UserRole } from './enums/user-role.enum';

async function createAdmin() {
  const app = await NestFactory.create(AppModule);
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  const email = 'admin@test.com';
  const password = '123456';
  const name = 'Admin User';

  // Vérifier si l'admin existe déjà
  const existingAdmin = await userModel.findOne({ email });

  if (existingAdmin) {
    console.log('Admin user already exists. Updating role to ADMIN...');
    existingAdmin.role = UserRole.ADMIN;
    await existingAdmin.save();
    console.log('✅ Admin user updated successfully!');
  } else {
    // Créer un nouvel admin
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new userModel({
      email,
      password: hashedPassword,
      name,
      role: UserRole.ADMIN,
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
  }

  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Role: ADMIN');

  await app.close();
}

createAdmin()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
