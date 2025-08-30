import { useState, useContext } from 'react';
import { Box, TextField, Button, styled, Typography, Container } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../../context/DataProvider.jsx';

const Component = styled(Box)`
    width: 400px;
    margin: auto;
    box-shadow: 5px 2px 5px 2px rgb(0 0 0 / 0.6);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;


const Image = styled('img')({
    width: 100,
    margin: 'auto',
    display: 'flex',
    padding: '50px 0 0',
});

const Wrapper = styled(Box)`
    padding: 25px 35px;
    display: flex;
    flex: 1;
    flex-direction: column;
    & > div, & > button, & > p {
        margin-top: 20px;
    }
`;

const LoginButton = styled(Button)`
    text-transform: none;
    background: #FB641B;
    color: #fff;
    height: 48px;
    border-radius: 2px;
    &:hover {
        background: #e55a17;
    }
`;

const SignupButton = styled(Button)`
    text-transform: none;
    background: #fff;
    color: #2874f0;
    height: 48px;
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    &:hover {
        background: #f5f5f5;
    }
`;

const Error = styled(Typography)`
    font-size: 10px;
    color: #ff6161;
    line-height: 0;
    margin-top: 10px;
    font-weight: 600;
`;

const Text = styled(Typography)`
    color: #878787;
    font-size: 16px;
`;

const loginInitialValues = {
    username: '',
    password: ''
};

const signupInitialValues = {
    name: '',
    username: '',
    password: ''
};

const Login = ({ isUserAuthenticated }) => {
    const imageURL = 'https://www.sesta.it/wp-content/uploads/2021/03/logo-blog-sesta-trasparente.png';
    const [account, toggleAccount] = useState('login');
    const [login, setLogin] = useState(loginInitialValues);
    const [signup, setSignup] = useState(signupInitialValues);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setAccount } = useContext(DataContext);

    const toggleSignup = () => {
        toggleAccount(account === 'signup' ? 'login' : 'signup');
        setError('');
    };

    const onValueChange = (e) => {
        const { name, value } = e.target;
        if (account === 'login') {
            setLogin({ ...login, [name]: value });
        } else {
            setSignup({ ...signup, [name]: value });
        }
    };

    const loginUser = async () => {
        if (!login.username || !login.password) {
            setError('Please fill all fields');
            return;
        }

        try {
            const { data } = await axios.post('http://localhost:8000/login', {
                user_name: login.username,
                password: login.password
            });
            
            if (data.success) {
                setError('');
                sessionStorage.setItem('accessToken', `Bearer ${data.accessToken}`);
                sessionStorage.setItem('refreshToken', `Bearer ${data.refreshToken}`);
                setAccount({ 
                    username: data.user.user_name, 
                    name: data.user.name 
                });
                isUserAuthenticated(true);
                navigate('/');
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    const signupUser = async () => {
        if (!signup.name || !signup.username || !signup.password) {
            setError('Please fill all fields');
            return;
        }

        try {
            const { data } = await axios.post('http://localhost:8000/adduser', {
                user_name: signup.username,
                password: signup.password,
                name: signup.name
            });
            
            if (data.success) {
                setSignup(signupInitialValues);
                toggleAccount('login');
                setError('');
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Signup failed. Username might be taken.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Component>
                <Box>
                    <Image src={imageURL} alt="login" />
                    {account === 'login' ? (
                        <Wrapper>
                            <TextField 
                                variant="standard" 
                                name="username" 
                                label="Username" 
                                onChange={onValueChange}
                                value={login.username}
                                fullWidth
                            />
                            <TextField 
                                variant="standard" 
                                name="password" 
                                label="Password" 
                                type="password"
                                onChange={onValueChange}
                                value={login.password}
                                fullWidth
                            />

                            {error && <Error>{error}</Error>}
                            <LoginButton 
                                variant="contained" 
                                onClick={loginUser}
                                fullWidth
                            >
                                Login
                            </LoginButton>
                            <Text style={{ textAlign: 'center' }}>OR</Text>
                            <SignupButton 
                                variant="outlined" 
                                onClick={toggleSignup}
                                fullWidth
                            >
                                Create an account
                            </SignupButton>
                        </Wrapper>
                    ) : (
                        <Wrapper>
                            <TextField 
                                variant="standard" 
                                name="name" 
                                label="Name" 
                                onChange={onValueChange}
                                value={signup.name}
                                fullWidth
                            />
                            <TextField 
                                variant="standard" 
                                name="username" 
                                label="Username" 
                                onChange={onValueChange}
                                value={signup.username}
                                fullWidth
                            />
                            <TextField 
                                variant="standard" 
                                name="password" 
                                label="Password" 
                                type="password"
                                onChange={onValueChange}
                                value={signup.password}
                                fullWidth
                            />

                            {error && <Error>{error}</Error>}
                            <SignupButton 
                                variant="outlined" 
                                onClick={signupUser}
                                fullWidth
                            >
                                Signup
                            </SignupButton>
                            <Text style={{ textAlign: 'center' }}>OR</Text>
                            <LoginButton 
                                variant="contained" 
                                onClick={toggleSignup}
                                fullWidth
                            >
                                Already have an account
                            </LoginButton>
                        </Wrapper>
                    )}
                </Box>
            </Component>
        </Container>
    );
};

export default Login;