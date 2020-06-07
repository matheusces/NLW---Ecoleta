import React, {useCallback, useState} from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';
import './styles.css';

interface Props {
    onFileUploaded: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ onFileUploaded }) => { // Define que a função aceita complementos (FC) do tipo Props 
    // recebendo a função vinda de create point.
    
    const [ selectedFileUrl , setSelectedFileUrl ] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];

        const fileUrl = URL.createObjectURL(file);

        setSelectedFileUrl(fileUrl);

        onFileUploaded(file); // executando a função.
    }, [onFileUploaded]);

    // isDragActive usado para saber quando a foto estiver por cima do campo de upload
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*'
    });

    return (
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} accept="image/*"/>
            {
                selectedFileUrl ?
                <img src={selectedFileUrl} alt="Point thumbnail" /> : 
                <p><FiUpload />Imagem do estabelecimento.</p>        
            }
        </div>
    )
}

export default Dropzone;