import { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Box, styled, FormControl, InputBase, Button, TextareaAutosize,
  Typography
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { CloudUpload } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { DataContext } from '../../context/DataProvider';
import axios from 'axios';

// API calls (consistent with CreatePost.jsx)
const API = {
  getPostById: async (id) => {
    try {
      const response = await axios.get(`https://verceldeploy-2nbo-git-main-saads-projects-6ca3a4b7.vercel.app/posts/${id}`);
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error fetching post:", error);
      return { isSuccess: false, error: error.message };
    }
  },
  updatePost: async (id, postData) => {
    try {
      // Convert id to number to match backend expectation
      const postId = parseInt(id);
      const response = await axios.put(`https://verceldeploy-2nbo-git-main-saads-projects-6ca3a4b7.vercel.app/posts/${postId}`, postData);
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error updating post:", error);
      return { isSuccess: false, error: error.message };
    }
  },
  uploadFile: async (formData) => {
    try {
      const response = await axios.post('https://verceldeploy-2nbo-git-main-saads-projects-6ca3a4b7.vercel.app/file/upload', formData);
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error uploading file:", error);
      return { isSuccess: false, error: error.message };
    }
  }
};

// Styled Components (consistent with CreatePost.jsx)
const Container = styled(Box)`
  margin: 50px 100px;
`;

const Image = styled('img')({
  width: '100%',
  height: '50vh',
  objectFit: 'cover'
});

const StyledFormControl = styled(FormControl)`
  margin-top: 10px;
  display: flex;
  flex-direction: row;
`;

const InputTextField = styled(InputBase)`
  flex: 1;
  margin: 0 30px;
  font-size: 25px;
`;

const Textarea = styled(TextareaAutosize)`
  width: 100%;
  margin-top: 50px;
  font-size: 18px;
  border: none;
  &:focus-visible {
    outline: none;
  }
`;

const DropzoneContainer = styled(Box)`
  border: 2px dashed #6495ED;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  margin-top: 20px;
  background-color: ${props => props.isDragActive ? '#f0f8ff' : 'transparent'};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f0f8ff;
  }
`;

const Update = () => {
  const [post, setPost] = useState({
    title: '',
    description: '',
    picture: '',
    username: '',
    categories: '',
    createdDate: new Date()
  });
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { account } = useContext(DataContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const url = post.picture ? `https://verceldeploy-2nbo-git-main-saads-projects-6ca3a4b7.vercel.app/file/${post.picture}` : 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9pJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80';

  // Fetch post data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response = await API.getPostById(id);
        if (response.isSuccess) {
          setPost(response.data);
        } else {
          console.error('Error fetching post:', response.error);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  });

  // Handle file upload
  useEffect(() => {
    const uploadFile = async () => {
      if (file) {
        setUploading(true);
        const data = new FormData();
        data.append("file", file);
        
        try {
          const uploadResponse = await API.uploadFile(data);
          if (uploadResponse.isSuccess) {
            setPost(prev => ({
              ...prev,
              picture: uploadResponse.data.filename
            }));
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        } finally {
          setUploading(false);
        }
      }
    };
    uploadFile();
  }, [file]);

  // Update blog post
  const updatePost = async () => {
    try {
      // Ensure we have the latest data including username
      const postData = {
        title: post.title,
        description: post.description,
        picture: post.picture,
        username: account.username || post.username,
        categories: post.categories
      };
      
      console.log('Updating post with data:', postData);
      
      const response = await API.updatePost(id, postData);
      if (response.isSuccess) {
        navigate(`/details/${id}`);
      } else {
        console.error('Update failed:', response.error);
        alert('Failed to update post. Please try again.');
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert('Error updating post. Please check console for details.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading post data...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Image src={url} alt="post" />

      <DropzoneContainer {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: '#6495ED', mb: 2 }} />
        {isDragActive ? (
          <Typography>Drop the image here...</Typography>
        ) : (
          <Typography>Drag & drop an image here, or click to select</Typography>
        )}
        {file && (
          <Typography>Selected file: {file.name}</Typography>
        )}
        {uploading && (
          <Typography>Uploading...</Typography>
        )}
      </DropzoneContainer>

      <StyledFormControl>
        <InputTextField 
          placeholder="Title" 
          onChange={handleChange} 
          name="title" 
          value={post.title}
        />
        <Button 
          variant="contained" 
          onClick={updatePost} 
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Update Post'}
        </Button>
      </StyledFormControl>

      <Textarea
        minRows={5}
        placeholder="Tell your story...."
        onChange={handleChange}
        name="description"
        value={post.description}
      />
    </Container>
  );
};

export default Update;
