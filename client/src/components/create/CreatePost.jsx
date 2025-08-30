import { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Box, styled, FormControl, InputBase, Button, TextareaAutosize, 
  Grid, Typography 
} from '@mui/material';
import { useLocation, useNavigate, Link, useSearchParams, useParams } from 'react-router-dom';
import { CloudUpload, Delete, Edit } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { DataContext } from '../../context/DataProvider';
import axios from 'axios';
// Add this import with your other imports
import Comments from '../create/comments/Comments.jsx'; // Adjust the path based on your project structure

// API calls
const API = {
  getAllPosts: async (params = {}) => {
    try {
      const response = await axios.get('https://verceldeploy-black.vercel.app/posts', { params });
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error fetching posts:", error);
      return { isSuccess: false, error: error.message };
    }
  },
  getPostById: async (id) => {
    try {
      const response = await axios.get(`https://verceldeploy-black.vercel.app/posts/${id}`);
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error fetching post:", error);
      return { isSuccess: false, error: error.message };
    }
  },
  deletePost: async (id) => {
    try {
      const response = await axios.delete(`https://verceldeploy-black.vercel.app/posts/${id}`);
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error deleting post:", error);
      return { isSuccess: false, error: error.message };
    }
  }
};

// Styled Components
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

const PostContainer = styled(Box)`
  border: 1px solid #d3cede;
  border-radius: 10px;
  margin: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 350px;
  & > img, & > p {
    padding: 0 5px 5px 5px;
  }
`;

const PostImage = styled('img')({
  width: '100%',
  objectFit: 'cover',
  borderRadius: '10px 10px 0 0',
  height: 150
});

const PostText = styled(Typography)`
  color: #878787;
  font-size: 12px;
`;

const PostHeading = styled(Typography)`
  font-size: 18px;
  font-weight: 600;
`;

const PostDetails = styled(Typography)`
  font-size: 14px;
  word-break: break-word;
`;

const DetailContainer = styled(Box)(({ theme }) => ({
  margin: '50px 100px',
  [theme.breakpoints.down('md')]: {
    margin: 0
  },
}));

const DetailImage = styled('img')({
  width: '100%',
  height: '50vh',
  objectFit: 'cover'
});

const EditIcon = styled(Edit)`
  margin: 5px;
  padding: 5px;
  border: 1px solid #878787;
  border-radius: 10px;
`;

const DeleteIcon = styled(Delete)`
  margin: 5px;
  padding: 5px;
  border: 1px solid #878787;
  border-radius: 10px;
`;

const DetailHeading = styled(Typography)`
  font-size: 38px;
  font-weight: 600;
  text-align: center;
  margin: 50px 0 10px 0;
`;

const Author = styled(Box)(({ theme }) => ({
  color: '#878787',
  display: 'flex',
  margin: '20px 0',
  [theme.breakpoints.down('sm')]: {
    display: 'block'
  },
}));

// Post Component
const Post = ({ post }) => {
  const url = post.picture ? `https://verceldeploy-black.vercel.app/file/${post.picture}` : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=752&q=80';
  
  const addEllipsis = (str, limit) => {
    return str.length > limit ? str.substring(0, limit) + '...' : str;
  } 

  return (
    <PostContainer>
      <PostImage src={url} alt="post" />
      <PostText>{post.categories}</PostText>
      <PostHeading>{addEllipsis(post.title, 20)}</PostHeading>
      <PostText>Author: {post.username}</PostText>
      <PostDetails>{addEllipsis(post.description, 100)}</PostDetails>
    </PostContainer>
  );
};

// Posts Component
const Posts = ({ category }) => {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => { 
      let response = await API.getAllPosts({ category: category || '' });
      if (response.isSuccess) {
        setPosts(response.data);
      }
    }
    fetchData();
  }, [category]);

  return (
    <>
      {
        posts?.length ? posts.map(post => (
          <Grid item lg={3} sm={4} xs={12} key={post.postId || post._id}>
            <Link style={{textDecoration: 'none', color: 'inherit'}} to={`/details/${post.postId}`}>
              <Post post={post} />
            </Link>
          </Grid>
        )) : <Box style={{color: '878787', margin: '30px 80px', fontSize: 18}}>
          No data is available for selected category
        </Box>
      }
    </>
  );
};


// DetailView Component
const DetailView = () => {
  const [post, setPost] = useState({});
  const { account } = useContext(DataContext);
  const navigate = useNavigate();
  const { id } = useParams();
  
  useEffect(() => {
    const fetchData = async () => {
      let response = await API.getPostById(id);
      if (response.isSuccess) {
        setPost(response.data);
      }
    }
    fetchData();
  }, [id]);

  // Fixed: Proper image URL handling
  const imageUrl = post.picture 
    ? `https://verceldeploy-black.vercel.app/file/${post.picture}` 
    : 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80';

  const deleteBlog = async () => {  
    await API.deletePost(post.postId);
    navigate('/')
  }

  return (
    <DetailContainer>
      <DetailImage src={imageUrl} alt="post" />
      <Box style={{ float: 'right' }}>
        {   
          account.username === post.username && 
          <>  
            <Link to={`/update/${post.postId}`}><EditIcon color="primary" /></Link>
            <DeleteIcon onClick={() => deleteBlog()} color="error" style={{ cursor: 'pointer' }} />
          </>
        }
      </Box>
      <DetailHeading>{post.title}</DetailHeading>

      <Author>
        <Link to={`/?username=${post.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography>Author: <span style={{fontWeight: 600}}>{post.username}</span></Typography>
        </Link>
        <Typography style={{marginLeft: 'auto'}}>{post.createdAt ? new Date(post.createdAt).toDateString() : ''}</Typography>
      </Author>

      <Typography>{post.description}</Typography>
      
      {/* Add Comments Component here */}
      <Comments post={post} />
    </DetailContainer>
  );
};

// Main CreatePost Component
const initialPost = {
  title: '',
  description: '',
  picture: '',
  username: '',
  categories: '',
  createdDate: new Date()
};

const CreatePost = () => {
  const [post, setPost] = useState(initialPost);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showPosts, setShowPosts] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { account } = useContext(DataContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  useParams();

  // Check if we're on a details page
  useEffect(() => {
    if (location.pathname.includes('/details/')) {
      setShowDetails(true);
    }
  }, [location.pathname]);

  const url = post.picture ? `https://verceldeploy-black.vercel.app/file/${post.picture}` : 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80';

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

  useEffect(() => {
    const uploadFile = async () => {
      if (file) {
        setUploading(true);
        const data = new FormData();
        data.append("file", file);
        
        try {
          const uploadResponse = await axios.post('https://verceldeploy-black.vercel.app/file/upload', data);
          setPost(prev => ({
            ...prev,
            picture: uploadResponse.data.filename
          }));
        } catch (error) {
          console.error("Error uploading file:", error);
        } finally {
          setUploading(false);
        }
      }
    };
    uploadFile();
    
    setPost(prev => ({
      ...prev,
      categories: location.search?.split('=')[1] || 'All',
      username: account.username
    }));
  }, [file, location.search, account.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const savePost = async () => {
    try {
      const response = await axios.post('https://verceldeploy-black.vercel.app/createpost', post);
      if (response.data.success) {
        navigate('/');
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const togglePostsView = () => {
    setShowPosts(!showPosts);
    setShowDetails(false);
  };

  const goBackToCreate = () => {
    setShowPosts(false);
    setShowDetails(false);
    navigate('/create');
  };

  if (showDetails) {
    return <DetailView />;
  }

  return (
    <Container>
      {!showPosts ? (
        <>
          <Image src={url} alt="banner" />

          <DropzoneContainer {...getRootProps()} isDragActive={isDragActive}>
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: '#6495ED', mb: 2 }} />
            {isDragActive ? (
              <p>Drop the image here...</p>
            ) : (
              <p>Drag & drop an image here, or click to select</p>
            )}
            {file && (
              <p>Selected file: {file.name}</p>
            )}
            {uploading && (
              <p>Uploading...</p>
            )}
          </DropzoneContainer>

          <StyledFormControl>
            <InputTextField 
              placeholder="Title" 
              onChange={handleChange} 
              name="title" 
              value={post.title}
            />
            <Button variant="contained" onClick={savePost} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Publish'}
            </Button>
            <Button variant="outlined" onClick={togglePostsView} style={{ marginLeft: '10px' }}>
              View Posts
            </Button>
          </StyledFormControl>

          <Textarea
            minRows={5}
            placeholder="Tell your story...."
            onChange={handleChange}
            name="description"
            value={post.description}
          />
        </>
      ) : (
        <>
          <Button variant="outlined" onClick={goBackToCreate} style={{ marginBottom: '20px' }}>
            Back to Create Post
          </Button>
          <Grid container>
            <Posts category={category} />
          </Grid>
        </>
      )}
    </Container>
  );
};

export default CreatePost;


