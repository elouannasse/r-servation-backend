import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

// Configuration du storage pour multer
export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/events',
    filename: (req: Request, file: Express.Multer.File, cb) => {
      // Générer un nom de fichier unique
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `event-${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    // Valider le type de fichier
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Type de fichier invalide. Seuls les fichiers JPG, JPEG et PNG sont acceptés.',
        ),
        false,
      );
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
};
