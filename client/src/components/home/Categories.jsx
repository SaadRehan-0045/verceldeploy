import { Button, Table, TableHead, TableBody, TableCell, TableRow, styled } from "@mui/material";
import { Link, useSearchParams } from "react-router-dom";

const StyledTable = styled(Table)`
    border: 1px solid rgba(224, 224, 224, 1);
`;

const StyledButton = styled(Button)`
    margin: 20px;
    width: 85%;
    background: #6495ED;
    color: #fff;
    &:hover {
        background: #4169E1;
    }
`;

const StyledLink = styled(Link)`
    text-decoration: none;
    color: inherit;
`;

export const categories = [
    { id: 1, type: 'Music' },
    { id: 2, type: 'Movies' },
    { id: 3, type: 'Sports' },
    { id: 4, type: 'Tech' },
    { id: 5, type: 'Fashion' }
];

const Categories = () => {
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');

    return (
        <>
            <StyledLink to={`/create-post?category=${category || ''}`}>
                <StyledButton variant="contained">Create Blog</StyledButton>
            </StyledLink>

            <StyledTable>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <StyledLink to="/">All Categories</StyledLink>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {categories.map((categoryItem) => (
                        <TableRow key={categoryItem.id}>
                            <TableCell>
                                <StyledLink to={`/?category=${categoryItem.type}`}>
                                    {categoryItem.type}
                                </StyledLink>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </StyledTable>
        </>
    );
};

export default Categories;