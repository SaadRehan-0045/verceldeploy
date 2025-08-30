import { useContext } from "react";
import { Typography, Box, styled, IconButton } from "@mui/material";
import { Delete } from '@mui/icons-material';
import { DataContext } from "../../../context/DataProvider";
import axios from 'axios';

// API calls for comments
const API = {
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

const Component = styled(Box)`
    margin-top: 30px;
    background: #F5F5F5;
    padding: 15px;
    border-radius: 8px;
`;

const Container = styled(Box)`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
`;

const Name = styled(Typography)`
    font-weight: 600;
    font-size: 16px;
    margin-right: 15px;
`;

const StyledDate = styled(Typography)`
    font-size: 14px;
    color: #878787;
`;

const DeleteIcon = styled(IconButton)`
    margin-left: auto;
    color: #f44336;
`;

const Comment = ({ comment, setToggle }) => {
    const { account } = useContext(DataContext)
    
    const removeComment = async () => {
       try {
           await API.deleteComment(comment._id || comment.commentId);
           setToggle(prev => !prev);
       } catch (error) {
           console.error("Failed to delete comment:", error);
       }
    }

    return (
        <Component>
            <Container>
                <Name variant="body1">{comment.name}</Name>
                <StyledDate variant="body2">
                    {new Date(comment.date).toLocaleDateString()} at {new Date(comment.date).toLocaleTimeString()}
                </StyledDate>
                { comment.name === account.username && (
                    <DeleteIcon onClick={removeComment} size="small">
                        <Delete fontSize="small" />
                    </DeleteIcon>
                )}
            </Container>
            <Typography variant="body1" style={{ wordBreak: 'break-word' }}>
                {comment.comments}
            </Typography>
        </Component>
    )
}

export default Comment;