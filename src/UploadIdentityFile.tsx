import {
  GoabFileUploadCard,
  GoabFileUploadInput,
  GoabFormItem,
} from "@abgov/react-components";
import { useState } from "react";
import {
  GoabFileUploadInputOnSelectFileDetail,
  GoabFileUploadOnCancelDetail,
  GoabFileUploadOnDeleteDetail,
} from "@abgov/ui-components-common";
import { Upload, MockUploader } from "./MockUploader";

interface UploadIdentityFileProps {
  onUpload?: (file: File) => void;
}

export const UploadIdentityFile = ({ onUpload }: UploadIdentityFileProps) => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [progressList, setProgressList] = useState<Record<string, number>>({});

  function deleteFile(fileName: string) {
    setUploads((uploadz) => {
      return uploadz.filter(u => fileName !== u.file.name);
    })
  }

  function uploadFile(file: File) {
    // Only allow one file upload
    if (uploads.length > 0) {
      console.warn("Only one file upload is allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target) return;
      const url = e.target.result;
      const uploader = new MockUploader();

      setUploads(old => [...old, { file, uploader }]);

      uploader.onabort = () => console.log("Aborting upload");
      uploader.onfail = err => console.log("Upload failed: ", err);
      uploader.oncomplete = () => {
        console.log("File upload complete");
        // Notify parent component about successful upload
        onUpload?.(file);
      };
      uploader.onprogress = percent => {
        setProgressList(old => ({ ...old, [file.name]: percent }));
      };

      if (url) {
        uploader.upload(url);
      }
    }
    reader.readAsDataURL(file);
  }

  return (
    <GoabFormItem label="Upload a picture of your government issue ID">
      <GoabFileUploadInput onSelectFile={(event: GoabFileUploadInputOnSelectFileDetail) => uploadFile(event.file)} maxFileSize="100MB" />
      {uploads.map(upload => (
        <GoabFileUploadCard
          testId={"file-upload"}
          key={upload.file.name}
          filename={upload.file.name}
          type={upload.file.type}
          size={upload.file.size}
          progress={progressList[upload.file.name]}
          onDelete={(detail: GoabFileUploadOnDeleteDetail) => deleteFile(detail.filename)}
          onCancel={(detail: GoabFileUploadOnCancelDetail) => deleteFile(detail.filename)}
        />
      ))}
    </GoabFormItem>
  )
}
