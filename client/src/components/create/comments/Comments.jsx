import { useState, useEffect, useContext } from 'react';
import { Box, TextareaAutosize, Button, styled } from '@mui/material';
import { DataContext } from '../../../context/DataProvider';
import axios from 'axios';

//components
import Comment from './Comment';

// API calls for comments
const API = {
  getAllComments: async (postId) => {
    try {
      const response = await axios.get(`http://localhost:8000/comments/${postId}`);
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error fetching comments:", error);
      return { isSuccess: false, error: error.message };
    }
  },
  newComment: async (commentData) => {
    try {
      const response = await axios.post('http://localhost:8000/comments', commentData);
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error creating comment:", error);
      return { isSuccess: false, error: error.message };
    }
  },
  deleteComment: async (commentId) => {
    try {
      const response = await axios.delete(`http://localhost:8000/comments/${commentId}`);
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return { isSuccess: false, error: error.message };
    }
  }
};

const Container = styled(Box)`
    margin-top: 100px;
    display: flex;
`;

const Image = styled('img')({
    width: 50,
    height: 50,
    borderRadius: '50%'
});

const StyledTextArea = styled(TextareaAutosize)`
    height: 100px !important;
    width: 100%; 
    margin: 0 20px;
    padding: 10px;
    font-size: 16px;
`;

const initialValue = {
    name: '',
    postId: '',
    date: new Date(),
    comments: ''
}

const Comments = ({ post }) => {
    const url = 'https://static.thenounproject.com/png/12017-200.png'

    const [comment, setComment] = useState(initialValue);
    const [comments, setComments] = useState([]);
    const [toggle, setToggle] = useState(false);
    const [loading, setLoading] = useState(false);

    const { account } = useContext(DataContext);

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            const response = await API.getAllComments(post.postId || post._id);
            if (response.isSuccess) {
                setComments(response.data);
            }
            setLoading(false);
        }
        getData();
    }, [toggle, post]);

    const handleChange = (e) => {
        setComment({
            ...comment,
            name: account.username,
            postId: post.postId || post._id,
            comments: e.target.value
        });
    }

    const addComment = async() => {
        if (!comment.comments.trim()) return;
        
        try {
            await API.newComment(comment);
            setComment(initialValue);
            setToggle(prev => !prev);
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    }
    
    return (
        <Box>
            <Container>
                <Image src={url} alt="dp" />   
                <StyledTextArea 
                    minRows={5}
                    placeholder="what's on your mind?"
                    onChange={(e) => handleChange(e)} 
                    value={comment.comments}
                />
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="medium" 
                    style={{ height: 40 }}
                    onClick={addComment}
                    disabled={!comment.comments.trim()}
                >Post</Button>             
            </Container>
            
            {loading && <Box>Loading comments...</Box>}
            
            <Box>
                {
                    comments && comments.length > 0 ? (
                        comments.map(comment => (
                            <Comment key={comment._id || comment.commentId} comment={comment} setToggle={setToggle} />
                        ))
                    ) : (
                        !loading && <Box style={{ marginTop: '20px', color: '#878787' }}>No comments yet. Be the first to comment!</Box>
                    )
                }
            </Box>
        </Box>
    )
}

export default Comments;