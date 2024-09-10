import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FileTree.css'; // Import the updated CSS file

const FileTree = ({ owner, repo, branch }) => {
  const [treeData, setTreeData] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [errorFetchingContent, setErrorFetchingContent] = useState(false);

  const token = process.env.REACT_APP_GITHUB_TOKEN;

  const fetchTree = async (path = '') => {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `token ${token}`,
        },
      });

      const items = response.data.map(async (item) => {
        if (item.name === 'node_modules') {
          return null; // Skip node_modules folder
        }

        if (item.type === 'dir') {
          const children = await fetchTree(item.path); // Recursively fetch subdirectories
          return {
            name: item.name,
            path: item.path,
            type: item.type,
            children,
          };
        } else {
          return {
            name: item.name,
            path: item.path,
            type: item.type,
            download_url: item.download_url, // Add download URL for files
          };
        }
      });

      return Promise.all(items).then((results) => results.filter(Boolean)); // Filter out null values
    } catch (error) {
      console.error('Error fetching file tree:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadTree = async () => {
      const tree = await fetchTree();
      setTreeData(tree);
    };

    loadTree();
  }, [owner, repo, branch, token]);

  const fetchFileContent = async (path) => {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `token ${token}`,
        },
      });

      const content = atob(response.data.content); // Decode base64 content
      setFileContent(content);
      setErrorFetchingContent(false); // No error
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileContent('Error fetching file content.');
      setErrorFetchingContent(true); // Set error flag
    }
  };

  const handleFileClick = (path, downloadUrl) => {
    setSelectedFilePath(path);
    fetchFileContent(path);
    console.log('Download URL:', downloadUrl); // Log the download URL
    setFileUrl(downloadUrl); // Set download URL
  };

  const handleDownload = async () => {
    try {
      if (!fileUrl) {
        console.error('No file URL available for download.');
        return;
      }

      const response = await axios({
        method: 'get',
        url: fileUrl,
        responseType: 'blob' // Important for handling binary data
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
      
      // Extract file name from the last part of the selectedFilePath
      const fileName = selectedFilePath.split('/').pop();

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName || 'file.txt'; // Use extracted filename

      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);

      console.log(`File downloaded: ${fileName}`);
    } catch (error) {
      console.error('Failed to download file:', error.message);
    }
  };

  const renderTree = (nodes) => {
    if (!nodes) return null;
    return (
      <ul className="tree">
        {nodes.map((node) => (
          <li key={node.path}>
            {node.type === 'dir' && (
              <>
                <span className="folder">{node.name}</span>
                {node.children && renderTree(node.children)}
              </>
            )}
            {node.type === 'file' && (
              <div className="file">
                <span onClick={() => handleFileClick(node.path, node.download_url)}>
                  {node.name}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="file-tree-container">
      <div className="file-tree-sidebar">
        <h2>File Tree</h2>
        {renderTree(treeData)}
      </div>
      <div className="file-content">
        {selectedFilePath && (
          <>
            <h3>Content of {selectedFilePath}</h3>
            <pre>{fileContent}</pre>
            {errorFetchingContent && fileUrl && (
              <div className="file-view">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <button className="view-button">View File</button>
                </a>
              </div>
            )}
            <div className="file-download">
              <button className="download-button" onClick={handleDownload}>
                Download File
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileTree;
