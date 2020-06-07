import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

import './styles.css';

interface Props {
  onFileUploaded: (file: File) => void,
}

const FileDropzone: React.FC<Props> = ({ onFileUploaded }) => {
  const [uploadedFileURL, setUploadedFileURL] = useState('');

  const onDrop = useCallback((files) => {
    const fileURL = URL.createObjectURL(files[0]);
    setUploadedFileURL(fileURL);
    onFileUploaded(files[0]);
  }, [onFileUploaded]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  return (
    <div className="dropzone" { ...getRootProps() }>
      <input {...getInputProps()} accept="image/*" />
      {uploadedFileURL ?
        (
          <img src={uploadedFileURL} alt="Ponto de coleta" />
        )
        : (
          <p>
            <FiUpload />
            Imagem do estabelecimento
          </p>
        )
      }
    </div>
  );
};

export default FileDropzone
