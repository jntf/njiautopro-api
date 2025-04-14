import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('documentation')
export class DocumentationController {
  private readonly docsDir = path.join(process.cwd(), 'doc');

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getDocIndex(@Res() res: Response) {
    try {
      const filePath = path.join(this.docsDir, 'README.md');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        res.send({ content });
      } else {
        res.status(404).send({ error: 'Documentation non trouvée' });
      }
    } catch (error) {
      res.status(500).send({ error: 'Erreur lors de la récupération de la documentation' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/list')
  async getDocList(@Res() res: Response) {
    try {
      if (fs.existsSync(this.docsDir)) {
        const files = fs.readdirSync(this.docsDir)
          .filter(file => file.endsWith('.md'))
          .map(file => ({
            name: file,
            path: file,
            title: file.replace('.md', '').replace(/-/g, ' '),
          }));
        res.send(files);
      } else {
        res.send([]);
      }
    } catch (error) {
      res.status(500).send({ error: 'Erreur lors de la récupération de la liste des documents' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:filename')
  async getDocFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      // Sanitize filename to prevent path traversal
      const sanitizedFilename = path.basename(filename);
      const filePath = path.join(this.docsDir, sanitizedFilename);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        res.send({ content });
      } else {
        res.status(404).send({ error: 'Document non trouvé' });
      }
    } catch (error) {
      res.status(500).send({ error: 'Erreur lors de la récupération du document' });
    }
  }
}
