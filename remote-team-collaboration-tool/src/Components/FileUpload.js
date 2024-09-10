
import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ owner, repo, branch }) => {
  const [file, setFile] = useState(null);
  const token = process.env.REACT_APP_GITHUB_TOKEN;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const filePath = file.name; // Set the file path; adjust as needed

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const content = btoa(reader.result); // Encode content to base64

        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
        const response = await axios.put(
          url,
          {
            message: `Upload ${filePath}`,
            content,
          },
          {
            headers: {
              Authorization: `token ${token}`,
            },
          }
        );
        console.log('File uploaded successfully:', response.data);
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <h2>Upload File</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default FileUpload;
