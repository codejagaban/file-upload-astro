import { useState } from "preact/hooks";

const FileUploader = () => {
  const [statusMessage, setStatusMessage] = useState("🤷‍♂ Nothing's uploaded yet");
  const [files, setFiles] = useState<FileList | null>(null);

  const updateStatusMessage = (message: string) => {
    setStatusMessage(message);
  };

  const resetFormState = () => {
    updateStatusMessage("🤷‍♂ Nothing's uploaded yet");
  };

  const handleInputChange = (event: Event) => {
    resetFormState();

    const target = event.target as HTMLInputElement;
    const selectedFiles = target.files;
    setFiles(selectedFiles);

    try {
      if (selectedFiles) {
        validateFiles(selectedFiles);
      }
    } catch (err: any) {
      updateStatusMessage(err.message);
      return;
    }
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();

    if (!files) {
      updateStatusMessage("❌ No files selected.");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("file", file));

    try {
      validateFiles(files);
    } catch (err: any) {
      updateStatusMessage(err.message);
      return;
    }

    updateStatusMessage("⏳ Uploading file...");
    await uploadFiles(formData);
  };

  const uploadFiles = async (formData: FormData) => {
    try {
      const response = await fetch("https://httpbin.org/post", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not OK");
      }

      const data = await response.json();
      console.log("File uploaded successfully:", data);
      updateStatusMessage("✅ File uploaded successfully.");
    } catch (error) {
      console.error("File upload failed:", error);
      updateStatusMessage("❌ File upload failed.");
    }
  };

  const validateFiles = (files: FileList | File[]) => {
    const validTypes = ["image/jpeg", "image/png"];
    const maxSize = 1024 * 1024; // 1MB
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        throw new Error(
          `❌ File "${file.name}" could not be uploaded. Only images with the following types are allowed: JPEG, PNG.`
        );
      }
      if (file.size > maxSize) {
        throw new Error(
          `❌ File "${file.name}" is too large. Maximum size is 1MB.`
        );
      }
    }
  };

  return (
    <div>
      <form
        method="post"
        encType="multipart/form-data"
        class="upload-form"
        onSubmit={handleSubmit}
      >
        <input
          name="file"
          type="file"
          multiple
          class="file-input"
          onChange={handleInputChange}
        />
        <button type="submit" disabled={!files}>
          Upload
        </button>
      </form>
      { statusMessage && <p id="status">{statusMessage}</p>}
      {files && [...files].map((file, i) => (
        <div key={i}>
        <p>{files.length > 1 ? `File details number ${i + 1}:` : "File details:"}</p>
        <ul>
          <li>📄Name: {file.name}</li>
          <li>Type: {file.type || "unknown"}</li>
          <li>Size: {(file.size / 1024).toFixed(2)} KB</li>
        </ul>
      </div>
      ))
      }
    </div>
  );
};

export default FileUploader;