import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

export default {
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, '..', '..', 'uploads'),
        filename(request, file, callback){
            const hash = crypto.randomBytes(6).toString('hex'); // gera caracteres aleatórios e os coloca em hex.
            
            const fileName = `${hash}-${file.originalname}`;

            callback(null, fileName);
        }
    }),
};