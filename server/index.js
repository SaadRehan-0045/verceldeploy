import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { Binary } from 'mongodb';

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://muhammadsaadrehan007:1234@reactandreactnative.c1nsfpq.mongodb.net/?retryWrites=true&w=majority&appName=ReactandReactNative', {
            
        });
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection error:", error);
    }
};

// JWT Secrets (should be in environment variables in production)
const ACCESS_SECRET_KEY = '1d006a060fdb3dcab5f2ae2a7d7d0badbe7173a720dc65eb95781015aa129919555718aedc361a7badfdf88ca20e5fc5c0de5ab4dd978cb8525fad805b4f0d7a';
const REFRESH_SECRET_KEY = '224042760d97291e087d250096193fd87ffe35f026d1faac234642b5c290dd931ee65797dc855dc50a77d474e66a797673486c57d28bbff5d730093b72175973';

// Token Model
const tokenSchema = new mongoose.Schema({
    token: String
});
const Token = mongoose.model('Token', tokenSchema);

// Express App Setup
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.post('/adduser', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        
        // Check if username already exists
        const existingUser = await db.collection('tekkens').findOne({
            user_name: req.body.user_name
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Generate a custom primary key
        const lastUser = await db.collection('tekkens')
            .find()
            .sort({ userId: -1 })
            .limit(1)
            .toArray();

        const newUserId = lastUser.length > 0 ? lastUser[0].userId + 1 : 1;

        // Insert new user with hashed password
        const result = await db.collection('tekkens').insertOne({
            userId: newUserId,
            user_name: req.body.user_name,
            password: hashedPassword,
            name: req.body.name,
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            userId: newUserId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
});

app.post('/login', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const user = await db.collection('tekkens').findOne({
            user_name: req.body.user_name
        });

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Compare hashed password with input password
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (isPasswordValid) {
            // Create tokens
            const accessToken = jwt.sign(
                {
                    userId: user.userId,
                    username: user.user_name
                },
                ACCESS_SECRET_KEY,
                { expiresIn: '15m' }
            );

            const refreshToken = jwt.sign(
                {
                    userId: user.userId,
                    username: user.user_name
                },
                REFRESH_SECRET_KEY
            );

            // Store refresh token in database
            await Token.create({ token: refreshToken });

            res.status(200).json({ 
                success: true,
                message: 'Login successful',
                accessToken,
                refreshToken,
                user: {
                    userId: user.userId,
                    name: user.name,
                    user_name: user.user_name
                }
            });
        } else {
            res.status(401).json({ 
                success: false,
                message: 'Invalid username or password'
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Login failed',
            error: error.message 
        });
    }
});



// Replace the GridFS setup with binary storage approach
// Remove the GridFS setup and use simple binary storage

// Configure multer for memory storage (to get buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PNG, JPG, and JPEG are allowed.'), false);
        }
    }
});

// File Upload API - Store as binary in MongoDB
app.post('/file/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const db = mongoose.connection.db;
        
        // Generate unique filename
        const filename = `${Date.now()}-${req.file.originalname}`;
        
        // Store file as binary in MongoDB
        const result = await db.collection('files').insertOne({
            filename: filename,
            originalName: req.file.originalname,
            contentType: req.file.mimetype,
            data: new Binary(req.file.buffer), // Store as binary
            size: req.file.size,
            uploadedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            filename: filename,
            id: result.insertedId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
});

// File Download API - Retrieve binary data
app.get('/file/:filename', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        
        const file = await db.collection('files').findOne({
            filename: req.params.filename
        });

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Set appropriate content type
        res.set('Content-Type', file.contentType);
        
        // Send binary data
        res.send(file.data.buffer);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving file',
            error: error.message
        });
    }
});

// Create Post API (unchanged, but now uses filename reference)
app.post('/createpost', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        
        // Generate a custom post ID
        const lastPost = await db.collection('posts')
            .find()
            .sort({ postId: -1 })
            .limit(1)
            .toArray();

        const newPostId = lastPost.length > 0 ? lastPost[0].postId + 1 : 1;

        // Insert new post
        const result = await db.collection('posts').insertOne({
            postId: newPostId,
            title: req.body.title,
            description: req.body.description,
            picture: req.body.picture, // This is the filename reference
            username: req.body.username,
            categories: req.body.categories,
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            postId: newPostId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating post',
            error: error.message
        });
    }
});


// Post revive turn please!!!!!!!!!!!!!

// Get all posts API
app.get('/posts', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { category } = req.query;
    
    let query = {};
    if (category && category !== 'All') {
      query.categories = category;
    }
    
    const posts = await db.collection('posts')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
});

// Get single post by ID
app.get('/posts/:id', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const postId = parseInt(req.params.id);
    
    const post = await db.collection('posts').findOne({
      postId: postId
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message
    });
  }
});

// Update post API
app.put('/posts/:id', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const postId = parseInt(req.params.id);
    
    const result = await db.collection('posts').updateOne(
      { postId: postId },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Post updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating post',
      error: error.message
    });
  }
});

// Delete post API
app.delete('/posts/:id', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const postId = parseInt(req.params.id);
    
    const result = await db.collection('posts').deleteOne({
      postId: postId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
});



////////////////////////Comment Section //////////////////////////////////
// Comment Schema (add near your other schemas)
const commentSchema = new mongoose.Schema({
  commentId: Number,
  postId: Number,
  name: String,
  comments: String,
  date: Date
});

// Comments API Routes (add these to your existing API routes)

// Create new comment
app.post('/comments', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    // Generate a custom comment ID
    const lastComment = await db.collection('comments')
      .find()
      .sort({ commentId: -1 })
      .limit(1)
      .toArray();

    const newCommentId = lastComment.length > 0 ? lastComment[0].commentId + 1 : 1;

    // Insert new comment
    const result = await db.collection('comments').insertOne({
      commentId: newCommentId,
      postId: req.body.postId,
      name: req.body.name,
      comments: req.body.comments,
      date: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      commentId: newCommentId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: error.message
    });
  }
});

// Get all comments for a post
app.get('/comments/:postId', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const postId = parseInt(req.params.postId);
    
    const comments = await db.collection('comments')
      .find({ postId: postId })
      .sort({ date: -1 })
      .toArray();
    
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
});

// Delete comment
app.delete('/comments/:commentId', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const commentId = parseInt(req.params.commentId);
    
    const result = await db.collection('comments').deleteOne({
      commentId: commentId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
});

// Server Start
const PORT = 8000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});