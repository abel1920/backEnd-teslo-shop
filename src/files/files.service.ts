import {join} from 'path'
import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class FilesService {

    getStaticProductImagen(imageName:string){

        //se crea la ruta en el servidor
        const path = join(__dirname, '../../static/products',imageName)

        if(!existsSync(path)){
            throw new BadRequestException(`No product found with image ${imageName}`)
        }
        return path
    }

}
